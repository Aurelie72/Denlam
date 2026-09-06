import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAsyncList } from "../../hooks/useAsyncList.js";
import { useImageFields } from "./useImageFields.js";
import {
  fetchCreations,
  createCreation,
  updateCreation,
  deleteCreation,
  reorderCreations,
  downloadBackup,
  fetchMessages,
  toggleMessageRead,
  deleteMessage,
  fetchEtudePlans,
  addEtudePlan,
  updateEtudePlan,
  deleteEtudePlan,
  reorderEtudePlans,
  resolveImageUrl,
  ApiError,
} from "../../services/api.js";
import ImagePicker from "./ImagePicker.jsx";
import "./Admin.css";

const emptyForm = { name: "", description: "", newFiles: [], existingImages: [] };
const emptyPlanForm = { description: "", newFiles: [], existingImages: [] };

export default function Admin() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // ---- Créations : liste ---------------------------------------------------
  const {
    items: creations,
    setItems: setCreations,
    isLoading: isLoadingList,
    error: listError,
    reload: loadCreations,
  } = useAsyncList(fetchCreations);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const creationFormRef = useRef(null);
  const creationImages = useImageFields(setForm);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  async function handleBackupDownload() {
    try {
      await downloadBackup(token);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur lors du téléchargement.");
    }
  }

  function startEdit(creation) {
    setEditingId(creation.id);
    setForm({
      name: creation.name,
      description: creation.description || "",
      newFiles: [],
      existingImages: creation.images?.length ? creation.images : creation.image ? [creation.image] : [],
    });
    setFormError(null);
    creationFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const totalImages = form.existingImages.length + form.newFiles.length;
    if (totalImages === 0) {
      setFormError("Ajoute au moins une photo.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      form.existingImages.forEach((img) => payload.append("existingImages", img));
      form.newFiles.forEach((file) => payload.append("images", file));

      if (editingId) {
        await updateCreation(editingId, payload, token);
      } else {
        await createCreation(payload, token);
      }

      cancelEdit();
      await loadCreations();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer définitivement cette création ?")) return;
    try {
      await deleteCreation(id, token);
      setCreations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur lors de la suppression.");
    }
  }

  // ---- Messages -------------------------------------------------------------
  const {
    items: messages,
    setItems: setMessages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useAsyncList(() => fetchMessages(token));

  async function handleToggleRead(id) {
    try {
      const updated = await toggleMessageRead(id, token);
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur.");
    }
  }

  async function handleDeleteMessage(id) {
    if (!window.confirm("Supprimer ce message ?")) return;
    try {
      await deleteMessage(id, token);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur lors de la suppression.");
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  // ---- Étude & Agencement : plans --------------------------------------------
  const {
    items: plans,
    setItems: setPlans,
    isLoading: isLoadingPlans,
    error: plansError,
    reload: loadPlans,
  } = useAsyncList(fetchEtudePlans);

  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [plansFormError, setPlansFormError] = useState(null);
  const planFormRef = useRef(null);
  const planImages = useImageFields(setPlanForm);

  function startEditPlan(plan) {
    setEditingPlanId(plan.id);
    setPlanForm({ description: plan.description || "", newFiles: [], existingImages: plan.images || [] });
    setPlansFormError(null);
    planFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEditPlan() {
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    setPlansFormError(null);
  }

  async function handleSubmitPlan(e) {
    e.preventDefault();
    setPlansFormError(null);

    const totalImages = planForm.existingImages.length + planForm.newFiles.length;
    if (totalImages === 0) {
      setPlansFormError("Ajoute au moins une photo.");
      return;
    }

    setIsSavingPlan(true);
    try {
      const formData = new FormData();
      formData.append("description", planForm.description);
      planForm.existingImages.forEach((img) => formData.append("existingImages", img));
      planForm.newFiles.forEach((file) => formData.append("images", file));

      if (editingPlanId) {
        await updateEtudePlan(editingPlanId, formData, token);
      } else {
        await addEtudePlan(formData, token);
      }

      cancelEditPlan();
      await loadPlans();
    } catch (err) {
      setPlansFormError(err instanceof ApiError ? err.message : "Erreur lors de l'envoi.");
    } finally {
      setIsSavingPlan(false);
    }
  }

  async function handleDeletePlan(id) {
    if (!window.confirm("Supprimer ce plan ?")) return;
    try {
      await deleteEtudePlan(id, token);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur lors de la suppression.");
    }
  }

  async function moveCreation(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= creations.length) return;

    const reordered = [...creations];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setCreations(reordered);

    try {
      await reorderCreations(reordered.map((c) => c.id), token);
    } catch (err) {
      setCreations(creations);
      alert(err instanceof ApiError ? err.message : "Erreur lors du réordonnancement.");
    }
  }

  async function movePlan(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= plans.length) return;

    const reordered = [...plans];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setPlans(reordered);

    try {
      await reorderEtudePlans(reordered.map((p) => p.id), token);
    } catch (err) {
      setPlans(plans);
      alert(err instanceof ApiError ? err.message : "Erreur lors du réordonnancement.");
    }
  }

  return (
    <section className="admin">
      {/* <h1 className="visually-hidden">Admin</h1> */}
      <p className="admin-desktop-only">
        L'espace d'administration n'est disponible que sur ordinateur.
        <br />
        Reviens depuis un écran plus grand pour gérer le site.
      </p>
      <div className="admin-header">
        <h1>Espace Admin</h1>
        <button className="btn btn-secondary" onClick={handleBackupDownload}>
          Télécharger une sauvegarde
        </button>
        <button className="btn" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      <p className="admin-welcome">
        Connecté en tant que <strong>{user?.username || "administrateur"}</strong>.
      </p>

      <div className="admin-form">
        <h3>Section "Étude &amp; Agencement"</h3>

        <h4 className="admin-subheading">{editingPlanId ? "Modifier le plan" : "Ajouter un plan : "} </h4>

        <form onSubmit={handleSubmitPlan} className="admin-etude-upload-form" ref={planFormRef}>
          <div className="admin-field admin-field-full">
            <textarea
              id="planDescription"
              aria-label="Texte du plan"
              rows="3"
              value={planForm.description}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="admin-field admin-field-full">
            <br />
            <ImagePicker
              inputId="planFiles"
              ariaLabel="Choisir des photos pour ce plan"
              existingImages={planForm.existingImages}
              onRemoveExisting={planImages.removeExisting}
              onSetCoverExisting={planImages.setCoverExisting}
              newFiles={planForm.newFiles}
              onAddFiles={planImages.addFiles}
              onRemoveNewFile={planImages.removeNewFile}
              onSetCoverNewFile={planImages.setCoverNewFile}
            />
          </div>

          {plansFormError && <p className="admin-error">{plansFormError}</p>}

          <div className="admin-form-actions">
            <button className="btn" type="submit" disabled={isSavingPlan}>
              {isSavingPlan ? "Enregistrement…" : editingPlanId ? "Enregistrer les modifications" : "Ajouter ce plan"}
            </button>
            {editingPlanId && (
              <button type="button" className="btn btn-secondary" onClick={cancelEditPlan}>
                Annuler
              </button>
            )}
          </div>
        </form>
        <hr className="admin-divider" />
        <h4 className="admin-subheading">Les plans existants :</h4>
        {plansError && <p className="admin-error">{plansError}</p>}
        {isLoadingPlans ? (
          <p>Chargement…</p>
        ) : plans.length === 0 ? (
          <p className="admin-empty">Aucun plan pour le moment.</p>
        ) : (
          <ul className="admin-plans-list">
            {plans.map((plan, index) => (
              <li key={plan.id} className="admin-plan-item">
                <div className="admin-plan-thumbs">
                  {plan.images.map((img, i) => (
                    <img key={img + i} src={resolveImageUrl(img)} alt="" />
                  ))}
                </div>
                <p className="admin-plan-description">{plan.description || <em>(sans texte)</em>}</p>
                <div className="admin-list-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() => movePlan(index, -1)}
                    disabled={index === 0}
                    aria-label="Monter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() => movePlan(index, 1)}
                    disabled={index === plans.length - 1}
                    aria-label="Descendre"
                  >
                    ↓
                  </button>

                  <button type="button" className="btn btn-small" onClick={() => startEditPlan(plan)}>
                    Modifier
                  </button>
                  <button type="button" className="btn btn-small btn-danger" onClick={() => handleDeletePlan(plan.id)}>
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-form">
        <h3>Section "Créations"</h3>

        <h4 className="admin-subheading">{editingId ? "Modifier la création" : "Ajouter une création :"}</h4>

        <form onSubmit={handleSubmit} ref={creationFormRef} className="admin-creation-form">
          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="name">Nom</label>
              <input id="name" name="name" required value={form.name} onChange={handleChange} />
            </div>

            <div className="admin-field admin-field-full">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" rows="3" required value={form.description} onChange={handleChange} />
            </div>

            <div className="admin-field admin-field-full">
              <label htmlFor="creationFiles">Photos</label>
              <ImagePicker
                inputId="creationFiles"
                existingImages={form.existingImages}
                onRemoveExisting={creationImages.removeExisting}
                onSetCoverExisting={creationImages.setCoverExisting}
                newFiles={form.newFiles}
                onAddFiles={creationImages.addFiles}
                onRemoveNewFile={creationImages.removeNewFile}
                onSetCoverNewFile={creationImages.setCoverNewFile}
              />
            </div>
          </div>

          {formError && <p className="admin-error">{formError}</p>}

          <div className="admin-form-actions">
            <button className="btn" type="submit" disabled={isSaving}>
              {isSaving ? "Enregistrement…" : editingId ? "Enregistrer les modifications" : "Ajouter"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                Annuler
              </button>
            )}
          </div>
        </form>

        <hr className="admin-divider" />

        <h4 className="admin-subheading">Créations existantes : </h4>

        {isLoadingList && <p>Chargement…</p>}
        {listError && <p className="admin-error">{listError}</p>}
        {!isLoadingList && !listError && creations.length === 0 && (
          <p className="admin-empty">Aucune création pour le moment.</p>
        )}

        <ul className="admin-list-items">
          {creations.map((c, index) => (
            <li key={c.id} className="admin-list-item">
              <img src={resolveImageUrl(c.image)} alt="" />
              <div className="admin-list-info">
                <p className="admin-list-name">{c.name}</p>
              </div>
              <div className="admin-list-actions">
                <button
                  className="btn btn-small"
                  onClick={() => moveCreation(index, -1)}
                  disabled={index === 0}
                  aria-label="Monter"
                >
                  ↑
                </button>
                <button
                  className="btn btn-small"
                  onClick={() => moveCreation(index, 1)}
                  disabled={index === creations.length - 1}
                  aria-label="Descendre"
                >
                  ↓
                </button>

                <button className="btn btn-small" onClick={() => startEdit(c)}>
                  Modifier
                </button>
                <button className="btn btn-small btn-danger" onClick={() => handleDelete(c.id)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-list">
        <h3>Messages reçus {unreadCount > 0 && <span className="admin-badge">{unreadCount} non lu(s)</span>}</h3>

        {isLoadingMessages && <p>Chargement…</p>}
        {messagesError && <p className="admin-error">{messagesError}</p>}
        {!isLoadingMessages && !messagesError && messages.length === 0 && (
          <p className="admin-empty">Aucun message pour le moment.</p>
        )}

        <ul className="admin-messages">
          {messages.map((m) => (
            <li key={m.id} className={m.read ? "admin-message" : "admin-message unread"}>
              <div className="admin-message-header">
                <div>
                  <p className="admin-message-name">{m.name}</p>
                  <p className="admin-message-meta">
                    {m.email}
                    {m.phone && ` · ${m.phone}`}
                  </p>
                </div>
                <p className="admin-message-date">
                  {new Date(m.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>

              <p className="admin-message-body">{m.message}</p>

              <div className="admin-list-actions">
                <button className="btn btn-small" onClick={() => handleToggleRead(m.id)}>
                  {m.read ? "Marquer comme non lu" : "Marquer comme lu"}
                </button>
                <button className="btn btn-small btn-danger" onClick={() => handleDeleteMessage(m.id)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
