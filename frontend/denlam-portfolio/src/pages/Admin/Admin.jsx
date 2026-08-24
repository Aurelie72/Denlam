import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  fetchCreations,
  createCreation,
  updateCreation,
  deleteCreation,
  fetchCreationsSettings,
  updateCreationsSettings,
  fetchMessages,
  toggleMessageRead,
  deleteMessage,
  fetchEtudeSettings,
  updateEtudeSettings,
  fetchEtudePlans,
  addEtudePlan,
  updateEtudePlan,
  deleteEtudePlan,
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

  const [creations, setCreations] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const creationFormRef = useRef(null);

  async function loadCreations() {
    setIsLoadingList(true);
    setListError(null);
    try {
      const data = await fetchCreations();
      setCreations(data);
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : "Erreur de chargement.");
    } finally {
      setIsLoadingList(false);
    }
  }

  useEffect(() => {
    loadCreations();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
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

  function addCreationFiles(files) {
    setForm((prev) => ({ ...prev, newFiles: [...prev.newFiles, ...files] }));
  }

  function removeCreationExistingImage(index) {
    setForm((prev) => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== index) }));
  }

  function removeCreationNewFile(index) {
    setForm((prev) => ({ ...prev, newFiles: prev.newFiles.filter((_, i) => i !== index) }));
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

  const [creationsDescription, setCreationsDescription] = useState("");
  const [isLoadingCreationsText, setIsLoadingCreationsText] = useState(true);
  const [isSavingCreationsText, setIsSavingCreationsText] = useState(false);
  const [creationsTextError, setCreationsTextError] = useState(null);
  const [creationsTextSaved, setCreationsTextSaved] = useState(false);

  useEffect(() => {
    fetchCreationsSettings()
      .then((data) => setCreationsDescription(data.description || ""))
      .catch((err) => setCreationsTextError(err instanceof ApiError ? err.message : "Erreur de chargement."))
      .finally(() => setIsLoadingCreationsText(false));
  }, []);

  async function handleCreationsTextSubmit(e) {
    e.preventDefault();
    setCreationsTextError(null);
    setIsSavingCreationsText(true);
    setCreationsTextSaved(false);
    try {
      const updated = await updateCreationsSettings(creationsDescription, token);
      setCreationsDescription(updated.description || "");
      setCreationsTextSaved(true);
    } catch (err) {
      setCreationsTextError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setIsSavingCreationsText(false);
    }
  }

  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState(null);

  async function loadMessages() {
    setIsLoadingMessages(true);
    setMessagesError(null);
    try {
      const data = await fetchMessages(token);
      setMessages(data);
    } catch (err) {
      setMessagesError(err instanceof ApiError ? err.message : "Erreur de chargement.");
    } finally {
      setIsLoadingMessages(false);
    }
  }

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const [etudeDescription, setEtudeDescription] = useState("");
  const [isLoadingEtudeText, setIsLoadingEtudeText] = useState(true);
  const [isSavingEtudeText, setIsSavingEtudeText] = useState(false);
  const [etudeTextError, setEtudeTextError] = useState(null);
  const [etudeTextSaved, setEtudeTextSaved] = useState(false);

  useEffect(() => {
    fetchEtudeSettings()
      .then((data) => setEtudeDescription(data.description || ""))
      .catch((err) => setEtudeTextError(err instanceof ApiError ? err.message : "Erreur de chargement."))
      .finally(() => setIsLoadingEtudeText(false));
  }, []);

  async function handleEtudeTextSubmit(e) {
    e.preventDefault();
    setEtudeTextError(null);
    setIsSavingEtudeText(true);
    setEtudeTextSaved(false);
    try {
      const updated = await updateEtudeSettings(etudeDescription, token);
      setEtudeDescription(updated.description || "");
      setEtudeTextSaved(true);
    } catch (err) {
      setEtudeTextError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setIsSavingEtudeText(false);
    }
  }

  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState(null);
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const planFormRef = useRef(null);

  async function loadPlans() {
    setIsLoadingPlans(true);
    setPlansError(null);
    try {
      const data = await fetchEtudePlans();
      setPlans(data);
    } catch (err) {
      setPlansError(err instanceof ApiError ? err.message : "Erreur de chargement.");
    } finally {
      setIsLoadingPlans(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  function startEditPlan(plan) {
    setEditingPlanId(plan.id);
    setPlanForm({ description: plan.description || "", newFiles: [], existingImages: plan.images || [] });
    setPlansError(null);
    planFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEditPlan() {
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    setPlansError(null);
  }

  function addPlanFiles(files) {
    setPlanForm((prev) => ({ ...prev, newFiles: [...prev.newFiles, ...files] }));
  }

  function removePlanExistingImage(index) {
    setPlanForm((prev) => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== index) }));
  }

  function removePlanNewFile(index) {
    setPlanForm((prev) => ({ ...prev, newFiles: prev.newFiles.filter((_, i) => i !== index) }));
  }

  async function handleSubmitPlan(e) {
    e.preventDefault();
    setPlansError(null);

    const totalImages = planForm.existingImages.length + planForm.newFiles.length;
    if (totalImages === 0) {
      setPlansError("Ajoute au moins une photo.");
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
      setPlansError(err instanceof ApiError ? err.message : "Erreur lors de l'envoi.");
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

  return (
    <section className="admin">
      <p className="admin-desktop-only">
  L'espace d'administration n'est disponible que sur ordinateur.
  <br />
  Reviens depuis un écran plus grand pour gérer le site.
</p>
      <div className="admin-header">
        <h2>Espace Admin</h2>
        <button className="btn" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      <p className="admin-welcome">
        Connecté en tant que <strong>{user?.username || "administrateur"}</strong>.
      </p>

      <div className="admin-form">
        <h3>Section "Étude &amp; Agencement"</h3>

        <form onSubmit={handleEtudeTextSubmit} className="admin-etude-text-form">
          {isLoadingEtudeText ? (
            <p>Chargement…</p>
          ) : (
            <>
              <div className="admin-field admin-field-full">
                <textarea
                  id="etudeDescription"
                  aria-label="Texte descriptif de la section Étude & Agencement"
                  rows="4"
                  value={etudeDescription}
                  onChange={(e) => {
                    setEtudeDescription(e.target.value);
                    setEtudeTextSaved(false);
                  }}
                />
              </div>

              {etudeTextError && <p className="admin-error">{etudeTextError}</p>}
              {etudeTextSaved && <p className="admin-success">Enregistré.</p>}

              <div className="admin-form-actions">
                <button className="btn" type="submit" disabled={isSavingEtudeText}>
                  {isSavingEtudeText ? "Enregistrement…" : "Enregistrer le texte"}
                </button>
              </div>
            </>
          )}
        </form>

        <hr className="admin-divider" />

        <h4 className="admin-subheading">
          {editingPlanId ? "Modifier le plan" : "Ajouter un plan : "} 
        </h4>

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
              onRemoveExisting={removePlanExistingImage}
              newFiles={planForm.newFiles}
              onAddFiles={addPlanFiles}
              onRemoveNewFile={removePlanNewFile}
            />
          </div>

          {plansError && <p className="admin-error">{plansError}</p>}

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
        <h4 className="admin-subheading">
          Les plans existants :
        </h4>
        {isLoadingPlans ? (
          <p>Chargement…</p>
        ) : plans.length === 0 ? (
          <p className="admin-empty">Aucun plan pour le moment.</p>
        ) : (
          <ul className="admin-plans-list">
            {plans.map((plan) => (
              <li key={plan.id} className="admin-plan-item">
                <div className="admin-plan-thumbs">
                  {plan.images.map((img, i) => (
                    <img key={img + i} src={resolveImageUrl(img)} alt="" />
                  ))}
                </div>
                <p className="admin-plan-description">{plan.description || <em>(sans texte)</em>}</p>
                <div className="admin-list-actions">
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

        <form onSubmit={handleCreationsTextSubmit}>
          {isLoadingCreationsText ? (
            <p>Chargement…</p>
          ) : (
            <>
              <div className="admin-field admin-field-full">
                <textarea
                  id="creationsDescription"
                  aria-label="Texte descriptif de la section Créations"
                  rows="3"
                  value={creationsDescription}
                  onChange={(e) => {
                    setCreationsDescription(e.target.value);
                    setCreationsTextSaved(false);
                  }}
                />
              </div>

              {creationsTextError && <p className="admin-error">{creationsTextError}</p>}
              {creationsTextSaved && <p className="admin-success">Enregistré.</p>}

              <div className="admin-form-actions">
                <button className="btn" type="submit" disabled={isSavingCreationsText}>
                  {isSavingCreationsText ? "Enregistrement…" : "Enregistrer le texte"}
                </button>
              </div>
            </>
          )}
        </form>

        <hr className="admin-divider" />

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
                onRemoveExisting={removeCreationExistingImage}
                newFiles={form.newFiles}
                onAddFiles={addCreationFiles}
                onRemoveNewFile={removeCreationNewFile}
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
          {creations.map((c) => (
            <li key={c.id} className="admin-list-item">
              <img src={resolveImageUrl(c.image)} alt={c.name} />
              <div className="admin-list-info">
                <p className="admin-list-name">{c.name}</p>
              </div>
              <div className="admin-list-actions">
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
        <h3>
          Messages reçus {unreadCount > 0 && <span className="admin-badge">{unreadCount} non lu(s)</span>}
        </h3>

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
                    {m.email} · {m.phone}
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
