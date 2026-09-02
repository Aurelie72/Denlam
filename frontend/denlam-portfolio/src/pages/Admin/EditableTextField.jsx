import { useEditableText } from "./useEditableText.js";

/**
 * Bloc de texte éditable complet et autonome : charge la valeur, affiche le
 * champ, gère la sauvegarde et les retours (erreur / "Enregistré."). Utilisé
 * pour l'intro Étude et l'intro Créations — même logique, même affichage,
 * juste la fonction de lecture/écriture qui change selon le contexte.
 *
 * <EditableTextField
 *   id="etudeDescription"
 *   ariaLabel="Texte descriptif de la section Étude & Agencement"
 *   rows={4}
 *   fetchFn={fetchEtudeSettings}
 *   updateFn={updateEtudeSettings}
 *   token={token}
 * />
 */
export default function EditableTextField({ id, ariaLabel, rows = 3, fetchFn, updateFn, token }) {
  const { value, isLoading, isSaving, error, saved, handleChange, handleSubmit } = useEditableText(
    fetchFn,
    updateFn,
    token
  );

  if (isLoading) return <p>Chargement…</p>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-field admin-field-full">
        <textarea
          id={id}
          aria-label={ariaLabel}
          rows={rows}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>

      {error && <p className="admin-error">{error}</p>}
      {saved && <p className="admin-success">Enregistré.</p>}

      <div className="admin-form-actions">
        <button className="btn" type="submit" disabled={isSaving}>
          {isSaving ? "Enregistrement…" : "Enregistrer le texte"}
        </button>
      </div>
    </form>
  );
}
