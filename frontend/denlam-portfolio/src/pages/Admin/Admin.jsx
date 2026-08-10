import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  fetchCreations,
  createCreation,
  updateCreation,
  deleteCreation,
  fetchAbout,
  updateAbout,
  resolveImageUrl,
  ApiError,
} from "../../services/api.js";
import "./Admin.css";

const emptyForm = { name: "", category: "lampe", description: "", imageFiles: [], existingImages: [] };
const emptyAboutForm = { name: "", bio: "", portraitFile: null, portraitUrl: "" };

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
      category: creation.category,
      description: creation.description || "",
      imageFiles: [],
      existingImages: creation.images?.length ? creation.images : creation.image ? [creation.image] : [],
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "imageFiles") {
      setForm((prev) => ({ ...prev, imageFiles: Array.from(files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!editingId && form.imageFiles.length === 0) {
      setFormError("Ajoute au moins une photo.");
      return;
    }

    setIsSaving(true);

    try {
      let payload;
      if (form.imageFiles.length > 0) {
        payload = new FormData();
        payload.append("name", form.name);
        payload.append("category", form.category);
        payload.append("description", form.description);
        form.imageFiles.forEach((file) => payload.append("images", file));
      } else {
        // En édition sans nouveau fichier : on garde les photos actuelles.
        payload = { name: form.name, category: form.category, description: form.description };
      }

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

  // ---- Section "À propos" ------------------------------------------------
  const [aboutForm, setAboutForm] = useState(emptyAboutForm);
  const [isLoadingAbout, setIsLoadingAbout] = useState(true);
  const [aboutError, setAboutError] = useState(null);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [aboutSaved, setAboutSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAbout()
      .then((data) => {
        if (!cancelled) {
          setAboutForm({
            name: data.name || "",
            bio: data.bio || "",
            portraitFile: null,
            portraitUrl: data.portrait || "",
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setAboutError(err instanceof ApiError ? err.message : "Erreur de chargement.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAbout(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleAboutChange(e) {
    const { name, value, files } = e.target;
    setAboutSaved(false);
    if (name === "portraitFile") {
      setAboutForm((prev) => ({ ...prev, portraitFile: files[0] || null }));
    } else {
      setAboutForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleAboutSubmit(e) {
    e.preventDefault();
    setAboutError(null);
    setIsSavingAbout(true);

    try {
      let payload;
      if (aboutForm.portraitFile) {
        payload = new FormData();
        payload.append("name", aboutForm.name);
        payload.append("bio", aboutForm.bio);
        payload.append("portrait", aboutForm.portraitFile);
      } else {
        payload = { name: aboutForm.name, bio: aboutForm.bio };
      }

      const updated = await updateAbout(payload, token);
      setAboutForm({
        name: updated.name || "",
        bio: updated.bio || "",
        portraitFile: null,
        portraitUrl: updated.portrait || "",
      });
      setAboutSaved(true);
    } catch (err) {
      setAboutError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setIsSavingAbout(false);
    }
  }

  return (
    <section className="admin">
      <div className="admin-header">
        <h2>Espace Admin</h2>
        <button className="btn" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      <p className="admin-welcome">
        Connecté en tant que <strong>{user?.username || "administrateur"}</strong>.
      </p>

      <form className="admin-form" onSubmit={handleAboutSubmit}>
        <h3>Section "À propos"</h3>

        {isLoadingAbout ? (
          <p>Chargement…</p>
        ) : (
          <>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="aboutName">Nom</label>
                <input
                  id="aboutName"
                  name="name"
                  required
                  value={aboutForm.name}
                  onChange={handleAboutChange}
                />
              </div>

              <div className="admin-field admin-field-full">
                <label htmlFor="aboutBio">Texte de présentation</label>
                <textarea
                  id="aboutBio"
                  name="bio"
                  rows="5"
                  value={aboutForm.bio}
                  onChange={handleAboutChange}
                />
              </div>

              <div className="admin-field admin-field-full">
                <label htmlFor="portraitFile">Photo (laisser vide pour garder l'actuelle)</label>
                <input
                  id="portraitFile"
                  name="portraitFile"
                  type="file"
                  accept="image/*"
                  onChange={handleAboutChange}
                />
                {aboutForm.portraitUrl && !aboutForm.portraitFile && (
                  <img
                    src={resolveImageUrl(aboutForm.portraitUrl)}
                    alt=""
                    className="admin-current-image"
                  />
                )}
              </div>
            </div>

            {aboutError && <p className="admin-error">{aboutError}</p>}
            {aboutSaved && <p className="admin-success">Enregistré.</p>}

            <div className="admin-form-actions">
              <button className="btn" type="submit" disabled={isSavingAbout}>
                {isSavingAbout ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </>
        )}
      </form>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Modifier la création" : "Ajouter une création"}</h3>

        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="name">Nom</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} />
          </div>

          <div className="admin-field">
            <label htmlFor="category">Catégorie</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              <option value="lampe">Lampe</option>
              <option value="mobilier">Mobilier</option>
              <option value="decoration">Décoration</option>
            </select>
          </div>

          <div className="admin-field admin-field-full">
            <label htmlFor="description">Description (optionnel)</label>
            <textarea id="description" name="description" rows="3" value={form.description} onChange={handleChange} />
          </div>

          <div className="admin-field admin-field-full">
            <label htmlFor="imageFiles">
              Photos {editingId ? "(laisser vide pour garder les photos actuelles)" : ""}
            </label>
            <input
              id="imageFiles"
              name="imageFiles"
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
            />
            <p className="admin-field-hint">
              Plusieurs photos possibles : la première sert de photo principale (vignette + carrousel).
              Sélectionner de nouveaux fichiers remplace toutes les photos actuelles.
            </p>

            {form.imageFiles.length === 0 && form.existingImages.length > 0 && (
              <div className="admin-current-images">
                {form.existingImages.map((img, i) => (
                  <img key={img + i} src={resolveImageUrl(img)} alt="" className="admin-current-image" />
                ))}
              </div>
            )}
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

      <div className="admin-list">
        <h3>Créations existantes</h3>

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
                <p className="admin-list-category">{c.category}</p>
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
    </section>
  );
}
