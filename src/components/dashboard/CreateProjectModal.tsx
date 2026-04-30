"use client";

import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Github,
} from "lucide-react";
import { fetchGraphQL } from "@/lib/graphQLClient";
import {
  CREATE_PROJECT,
  ADD_PROJECT_MEMBER,
  GET_SUBJECTS,
} from "@/graphql/misc/operations";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { Subject } from "@/types/project";
import { useT } from "@/hooks/useT";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
interface ProjectFormData {
  name: string;
  description: string;
  color: string;
  status: string;
  methodology: string;
  isPublic: boolean;
  subjectId: string;
  mode: string;
  isInstitutional: boolean;
  professorId: string;
}
interface PendingMember {
  email: string;
  role: string;
  isExternal: boolean;
}
interface PendingRepository {
  name: string;
  owner: string;
  repoName: string;
}

const UCN_DOMAINS = ["@alumnos.ucn.cl", "@ucn.cl", "@ce.ucn.cl"];
function isValidUcnEmail(email: string) {
  return UCN_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}

const ROLE_OPTION_VALUES = [
  { value: "LEADER", es: "Líder" },
  { value: "STUDENT", es: "Estudiante" },
  { value: "SUPERVISOR", es: "Supervisor" },
];

const INITIAL_FORM: ProjectFormData = {
  name: "",
  description: "",
  color: "#2596BE",
  status: "ACTIVE",
  methodology: "KANBAN",
  isPublic: false,
  subjectId: "",
  mode: "CLASSIC",
  isInstitutional: false,
  professorId: "",
};

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const { t } = useT();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("STUDENT");
  const [isExternal, setIsExternal] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [repoName, setRepoName] = useState("");
  const [repoOwner, setRepoOwner] = useState("");
  const [repoProjectName, setRepoProjectName] = useState("");
  const [repoError, setRepoError] = useState<string | null>(null);
  const [pendingRepositories, setPendingRepositories] = useState<
    PendingRepository[]
  >([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingSubjects(true);
      fetchGraphQL({ query: GET_SUBJECTS })
        .then((res) => {
          if (res?.subjects) setSubjects(res.subjects as Subject[]);
        })
        .catch(console.error)
        .finally(() => setIsLoadingSubjects(false));
    } else {
      setFormData(INITIAL_FORM);
      setPendingMembers([]);
      setPendingRepositories([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : undefined;
    setFormData((prev) => ({ ...prev, [name]: isCheckbox ? checked : value }));
  };

  const handleModeChange = (mode: "CLASSIC" | "HYBRID") =>
    setFormData((prev) => ({ ...prev, mode }));

  const handleAddMember = () => {
    setMemberError(null);
    const trimmed = memberEmail.trim().toLowerCase();
    if (!trimmed) {
      setMemberError(t("createProject.errorEmailEmpty"));
      return;
    }
    if (pendingMembers.some((m) => m.email === trimmed)) {
      setMemberError(t("createProject.errorEmailDuplicate"));
      return;
    }
    if (isExternal) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setMemberError(t("createProject.errorEmailExternal"));
        return;
      }
      setPendingMembers((prev) => [
        ...prev,
        { email: trimmed, role: "EXTERNAL", isExternal: true },
      ]);
    } else {
      if (!isValidUcnEmail(trimmed)) {
        setMemberError(
          t("createProject.errorEmailDomain").replace(
            "{domains}",
            UCN_DOMAINS.join(", "),
          ),
        );
        return;
      }
      setPendingMembers((prev) => [
        ...prev,
        { email: trimmed, role: memberRole, isExternal: false },
      ]);
    }
    setMemberEmail("");
  };

  const handleRemoveMember = (email: string) =>
    setPendingMembers((prev) => prev.filter((m) => m.email !== email));

  const handleAddRepository = () => {
    setRepoError(null);
    const [tName, tOwner, tRepo] = [
      repoName.trim(),
      repoOwner.trim(),
      repoProjectName.trim(),
    ];
    if (!tName || !tOwner || !tRepo) {
      setRepoError(t("createProject.errorRepoFields"));
      return;
    }
    if (
      pendingRepositories.some(
        (r) => r.owner === tOwner && r.repoName === tRepo,
      )
    ) {
      setRepoError(t("createProject.errorRepoDuplicate"));
      return;
    }
    setPendingRepositories((prev) => [
      ...prev,
      { name: tName, owner: tOwner, repoName: tRepo },
    ]);
    setRepoName("");
    setRepoOwner("");
    setRepoProjectName("");
  };

  const handleRemoveRepository = (i: number) =>
    setPendingRepositories((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetchGraphQL({
        query: CREATE_PROJECT,
        variables: {
          input: {
            name: formData.name,
            description: formData.description || undefined,
            color: formData.color,
            status: formData.status,
            methodology: formData.methodology,
            isPublic: formData.isPublic,
            mode: formData.mode,
            isInstitutional: formData.isInstitutional,
            subjectId: formData.subjectId || undefined,
            professorId: formData.isInstitutional
              ? formData.professorId
              : undefined,
            repositories:
              pendingRepositories.length > 0 ? pendingRepositories : undefined,
          },
        },
      });
      if (response.errors)
        throw new Error(
          response.errors[0]?.message ?? t("createProject.errorCreate"),
        );
      const projectId: string =
        response.data?.createProject?.id ?? response.createProject?.id;
      if (projectId && pendingMembers.length > 0) {
        await Promise.allSettled(
          pendingMembers.map((m) =>
            fetchGraphQL({
              query: ADD_PROJECT_MEMBER,
              variables: { input: { projectId, email: m.email, role: m.role } },
            }),
          ),
        );
      }
      setFormData(INITIAL_FORM);
      setPendingMembers([]);
      setPendingRepositories([]);
      setMemberEmail("");
      setMemberRole("STUDENT");
      setIsExternal(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t("createProject.errorUnexpected"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel = (m: PendingMember) => {
    if (m.isExternal) return t("createProject.roleExternal");
    return ROLE_OPTION_VALUES.find((r) => r.value === m.role)?.es ?? m.role;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-primary rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary bg-surface-primary shrink-0">
          <h2 className="text-xl font-bold text-text-primary">
            {t("createProject.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-text-primary hover:bg-surface-tertiary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <form
            id="create-project-form"
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
          >
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-primary block">
                {t("createProject.managementMode")}{" "}
                <span className="text-brand">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["CLASSIC", "HYBRID"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleModeChange(mode)}
                    className={`relative p-4 rounded-xl text-left border-2 transition-all duration-200 flex flex-col gap-1 ${formData.mode === mode ? "border-brand bg-brand/5 shadow-sm" : "border-border-primary hover:border-border-secondary bg-surface-primary"}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span
                        className={`font-bold text-sm ${formData.mode === mode ? "text-brand" : "text-text-secondary"}`}
                      >
                        {mode === "CLASSIC"
                          ? t("createProject.modeClassic")
                          : t("createProject.modeHybrid")}
                      </span>
                      {formData.mode === mode && (
                        <CheckCircle2 className="w-4 h-4 text-brand" />
                      )}
                    </div>
                    <span className="text-xs text-text-muted leading-relaxed">
                      {mode === "CLASSIC"
                        ? t("createProject.modeClassicDesc")
                        : t("createProject.modeHybridDesc")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px w-full bg-border-primary"></div>

            <Input
              id="name"
              label={t("createProject.projectName")}
              name="name"
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Plataforma de Trazabilidad UCN"
            />
            <Textarea
              id="description"
              label={t("createProject.description")}
              name="description"
              rows={3}
              maxLength={500}
              value={formData.description}
              onChange={handleChange}
              placeholder="Un breve resumen de la meta del proyecto..."
            />

            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                name="isInstitutional"
                checked={formData.isInstitutional}
                onChange={(e) => {
                  handleChange(e);
                  if (!e.target.checked)
                    setFormData((prev) => ({
                      ...prev,
                      subjectId: "",
                      professorId: "",
                    }));
                }}
                className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
              />
              <span className="text-sm font-semibold text-text-primary">
                {t("createProject.institutionalCheckbox")}
              </span>
            </label>

            {formData.isInstitutional && (
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-brand/5 border border-brand/10 rounded-xl animate-in fade-in slide-in-from-top-2">
                <Select
                  id="subjectId"
                  label={t("createProject.subject")}
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={(e) => {
                    handleChange(e);
                    setFormData((prev) => ({ ...prev, professorId: "" }));
                  }}
                  disabled={isLoadingSubjects}
                  required={formData.isInstitutional}
                >
                  <option value="">{t("createProject.selectSubject")}</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.code ? `(${s.code})` : ""}
                    </option>
                  ))}
                </Select>
                <Select
                  id="professorId"
                  label={t("createProject.professor")}
                  name="professorId"
                  value={formData.professorId}
                  onChange={handleChange}
                  disabled={!formData.subjectId}
                  required={formData.isInstitutional}
                >
                  <option value="">{t("createProject.selectProfessor")}</option>
                  {subjects
                    .find((s) => s.id === formData.subjectId)
                    ?.professors?.map((p: { id: string; name: string }) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </Select>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                id="status"
                label={t("createProject.status")}
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">
                  {t("createProject.statusActive")}
                </option>
                <option value="ON_HOLD">
                  {t("createProject.statusOnHold")}
                </option>
              </Select>
              {formData.mode === "CLASSIC" && (
                <Select
                  id="methodology"
                  label={t("createProject.methodology")}
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleChange}
                >
                  <option value="KANBAN">Kanban</option>
                  <option value="SCRUM">
                    {t("createProject.methodologyScrum")}
                  </option>
                  <option value="SCRUMBAN">
                    {t("createProject.methodologyScrumban")}
                  </option>
                </Select>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-secondary rounded-xl border border-border-secondary">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="color"
                  className="text-sm font-medium text-text-secondary"
                >
                  {t("createProject.labelColor")}
                </label>
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer overflow-hidden appearance-none bg-transparent"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                />
                <span className="text-sm font-medium text-text-secondary">
                  {t("createProject.makePublic")}
                </span>
              </label>
            </div>

            <div className="pt-2 border-t border-border-primary space-y-3">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-text-primary">
                  {t("createProject.githubRepos")}
                </h3>
                <span className="text-xs text-gray-400 font-normal">
                  {t("createProject.optional")}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="Etiqueta (Ej. Backend)"
                    className="w-full"
                  />
                  <Input
                    type="text"
                    value={repoOwner}
                    onChange={(e) => setRepoOwner(e.target.value)}
                    placeholder="Owner (Ej. fb)"
                    className="w-full"
                  />
                  <Input
                    type="text"
                    value={repoProjectName}
                    onChange={(e) => setRepoProjectName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddRepository())
                    }
                    placeholder="Repo (Ej. react)"
                    className="w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddRepository}
                  className="w-full sm:w-auto self-end px-4 py-2 text-sm font-medium bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors"
                >
                  {t("createProject.addRepository")}
                </button>
              </div>
              {repoError && (
                <p className="text-xs text-red-500 flex gap-1 items-center">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {repoError}
                </p>
              )}
              {pendingRepositories.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {pendingRepositories.map((repo, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-surface-primary rounded-lg border border-border-secondary text-sm shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-text-primary font-bold">
                          {repo.name}
                        </span>
                        <span className="text-xs text-text-muted truncate">
                          ({repo.owner}/{repo.repoName})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRepository(index)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-2 border-t border-border-primary space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-text-primary">
                  {t("createProject.teamMembers")}
                </h3>
                <span className="text-xs text-gray-400 font-normal">
                  {t("createProject.optional")}
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none w-fit">
                <input
                  type="checkbox"
                  checked={isExternal}
                  onChange={(e) => {
                    setIsExternal(e.target.checked);
                    setMemberError(null);
                  }}
                  className="w-3.5 h-3.5 text-brand border-gray-300 rounded focus:ring-brand"
                />
                {t("createProject.externalCollaborator")}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddMember())
                  }
                  placeholder={
                    isExternal ? "correo@externo.com" : "correo@alumnos.ucn.cl"
                  }
                  className="flex-1 min-w-0"
                />
                <div className="flex gap-2">
                  {!isExternal && (
                    <Select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      className="w-full sm:w-auto"
                    >
                      {ROLE_OPTION_VALUES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.es}
                        </option>
                      ))}
                    </Select>
                  )}
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-4 py-2 text-sm font-medium bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors shrink-0"
                  >
                    {t("createProject.addMember")}
                  </button>
                </div>
              </div>
              {memberError && (
                <p className="text-xs text-red-500 flex gap-1 items-center">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {memberError}
                </p>
              )}
              {pendingMembers.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {pendingMembers.map((m) => (
                    <li
                      key={m.email}
                      className="flex items-center justify-between px-3 py-2 bg-surface-primary rounded-lg border border-border-secondary text-sm shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-text-primary font-medium">
                          {m.email}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0 ${m.isExternal ? "bg-gray-200 text-gray-600" : "bg-brand/10 text-brand"}`}
                        >
                          {roleLabel(m)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.email)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border-primary bg-surface-secondary flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-primary border border-border-secondary rounded-lg hover:bg-surface-tertiary transition-colors disabled:opacity-50"
          >
            {t("modal.cancel")}
          </button>
          <button
            type="submit"
            form="create-project-form"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("modal.creating")}
              </>
            ) : (
              t("createProject.createProject")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
