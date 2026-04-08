import { ref, computed } from "vue";
import router from "@/router";
import { postUrlEncodedRequest, sendRequest } from "@/utils/api";
import Tr from "@/i18n/translation";

export interface LabelArtist {
  id: string;
  pseudonym: string;
}

const ADD_LABEL_USER_URL = "/ajax_vue/ajax/profile/addLableUser.php";
const AUTH_LABEL_USER_URL = "/ajax_vue/ajax/profile/authLableUser.php";
const LABEL_RETURN_USER_SS = "vauvision_label_return_user_id";
const LABEL_GROUP_ROSTER_SS = "vauvision_label_group_roster";
const LABEL_CONTEXT_SS = "vauvision_label_context_group";

interface LabelContextSnapshot {
  groupId: string | number;
  groupName: string;
}

function readStoredLabelReturnUserId(): string | null {
  try {
    const v = sessionStorage.getItem(LABEL_RETURN_USER_SS);
    if (v == null || String(v).trim() === "") return null;
    return String(v).trim();
  } catch {
    return null;
  }
}

function readStoredLabelGroupRoster(): LabelArtist[] {
  try {
    const raw = sessionStorage.getItem(LABEL_GROUP_ROSTER_SS);
    if (!raw) return [];
    const arr = JSON.parse(raw) as LabelArtist[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeStoredLabelGroupRoster(list: LabelArtist[]) {
  try {
    sessionStorage.setItem(LABEL_GROUP_ROSTER_SS, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function readStoredLabelContext(): LabelContextSnapshot | null {
  try {
    const raw = sessionStorage.getItem(LABEL_CONTEXT_SS);
    if (!raw) return null;
    const o = JSON.parse(raw) as Record<string, unknown>;
    const gid = o.groupId;
    const gname = o.groupName;
    if (gid == null || gid === "") return null;
    const nameStr =
      typeof gname === "string" ? gname.trim() : String(gname ?? "").trim();
    if (!nameStr) return null;
    const n = Number(gid);
    if (!Number.isFinite(n) || n <= 0) return null;
    return { groupId: gid as string | number, groupName: nameStr };
  } catch {
    return null;
  }
}

function writeStoredLabelContext(ctx: LabelContextSnapshot) {
  try {
    sessionStorage.setItem(LABEL_CONTEXT_SS, JSON.stringify(ctx));
  } catch {
    /* ignore */
  }
}

export function clearStoredLabelReturnUserId() {
  try {
    sessionStorage.removeItem(LABEL_RETURN_USER_SS);
    sessionStorage.removeItem(LABEL_GROUP_ROSTER_SS);
    sessionStorage.removeItem(LABEL_CONTEXT_SS);
  } catch {
    /* ignore */
  }
  labelReturnUserId.value = null;
}

function deriveMaxBitrixGroupId(groups: unknown): number | null {
  if (!Array.isArray(groups) || groups.length === 0) return null;
  const nums = groups
    .map((g) => Number(g))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  const maxG = Math.max(...nums);
  return maxG > 4 ? maxG : null;
}

export const labelGroupId = ref<string | number>(0);
export const labelGroupName = ref("");
export const apiLabelArtists = ref<LabelArtist[]>([]);
export const apiIsLabel = ref(false);
export const artistsRootRef = ref<HTMLElement | null>(null);
export const artistsDropdownOpen = ref(false);
export const labelArtists = ref<LabelArtist[]>([]);
export const addArtistModalOpen = ref(false);
export const newArtistPseudonym = ref("");
export const addArtistError = ref("");
export const addArtistSubmitting = ref(false);
export const showLabelArtistsSection = ref(false);
export const artistCabinetSwitching = ref(false);
export const bitrixUserId = ref("");
export const labelReturnUserId = ref<string | null>(readStoredLabelReturnUserId());
/** Логин из getData — для проверки псевдонима без привязки к Menu.userData */
export const labelMenuUserLogin = ref("");

function mapGroupMembers(members: unknown): LabelArtist[] {
  if (!Array.isArray(members)) return [];
  const out: LabelArtist[] = [];
  for (const raw of members) {
    const m = raw as Record<string, unknown>;
    const id = m.ID ?? m.id;
    if (id == null || id === "") continue;
    const login = String(m.LOGIN ?? m.login ?? "").trim();
    const name = String(m.NAME ?? m.name ?? "").trim();
    const lastName = String(m.LAST_NAME ?? m.lastName ?? "").trim();
    const pseudonym =
      login || [name, lastName].filter(Boolean).join(" ").trim() || "Артист";
    out.push({ id: String(id), pseudonym });
  }
  return out;
}

function syncLabelFromProfile(
  profile: Record<string, unknown> | null | undefined,
  user?: Record<string, unknown> | null
) {
  if (!profile) return;
  const uf = user?.uf as Record<string, unknown> | undefined;
  const isLabel =
    profile.isLabel === true ||
    uf?.UF_LEBL === 1 ||
    uf?.UF_LEBL === "1";
  apiIsLabel.value = !!isLabel;
  apiLabelArtists.value = mapGroupMembers(profile.groupMembers);

  const derived = deriveMaxBitrixGroupId(user?.groups);
  const gid =
    profile.maxGroup ?? profile.groupId ?? profile.labelGroupId ?? derived;
  const n = gid == null || gid === "" ? NaN : Number(gid);
  if (Number.isFinite(n) && n > 0) {
    labelGroupId.value = gid as string | number;
  } else {
    labelGroupId.value = 0;
  }
  const gname = profile.groupName;
  labelGroupName.value =
    typeof gname === "string" ? gname.trim() : String(gname ?? "").trim();
}

function parseAddLableUserPhpResponse(
  raw: unknown
): { ok: true; userId: string } | { ok: false; message: string } {
  const rawStr =
    raw === null || raw === undefined ? "" : String(raw).replace(/^\uFEFF/, "");
  const noTags = rawStr.replace(/<[^>]+>/g, " ");
  const s = noTags.trim();
  const pickNumericId = (text: string): string | null => {
    const t = text.trim();
    if (/^\d+$/.test(t)) return t;
    const lines = t
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/^\d+$/.test(lines[i])) return lines[i];
    }
    return null;
  };
  const idStr = pickNumericId(s);
  if (idStr) {
    const n = parseInt(idStr, 10);
    if (n > 0) return { ok: true, userId: idStr };
  }
  if (s === "" || s === "0") {
    return {
      ok: false,
      message:
        "Такой артист уже существует в нашей системе. Укажите уникальный псевдоним, либо обратитесь в нашу поддержку.",
    };
  }
  return { ok: false, message: s };
}

export const viewingArtistAsLabelManager = computed(() => {
  const ret = labelReturnUserId.value;
  const cur = bitrixUserId.value;
  if (!ret) return false;
  if (!cur) return true;
  return String(ret) !== String(cur);
});

export const hasOtherArtistsInRoster = computed(() => {
  const list = labelArtists.value;
  const cur = bitrixUserId.value;
  if (!list.length) return false;
  if (!cur) return list.length > 1;
  return list.some((a) => String(a.id) !== String(cur));
});

export const useDropdownArtistList = computed(() => {
  if (viewingArtistAsLabelManager.value) return true;
  if (apiIsLabel.value && hasOtherArtistsInRoster.value) return true;
  return false;
});

export const showStandaloneAddArtist = computed(
  () => !useDropdownArtistList.value
);

export function isLabelAccountRow(artistId: string): boolean {
  if (apiIsLabel.value && String(artistId) === String(bitrixUserId.value))
    return true;
  const ret = labelReturnUserId.value;
  if (ret && String(artistId) === String(ret)) return true;
  return false;
}

export function refreshLabelArtists() {
  labelReturnUserId.value = readStoredLabelReturnUserId();
  const ret = labelReturnUserId.value;
  const cur = bitrixUserId.value;
  const viewingMgr = !!ret && (!cur || String(ret) !== String(cur));

  let merged = [...apiLabelArtists.value];
  if (viewingMgr) {
    const snap = readStoredLabelGroupRoster();
    if (snap.length) {
      const byId = new Map<string, LabelArtist>();
      for (const a of snap) byId.set(a.id, { ...a });
      for (const a of merged) byId.set(a.id, { ...a });
      merged = Array.from(byId.values());
    }
    if (!merged.length && snap.length) {
      merged = [...snap];
    }
  }

  labelArtists.value = merged;
  if (viewingMgr) {
    const ctx = readStoredLabelContext();
    const badGroup =
      !labelGroupId.value ||
      labelGroupId.value === 0 ||
      labelGroupId.value === "" ||
      !String(labelGroupName.value || "").trim();
    if (badGroup && ctx) {
      labelGroupId.value = ctx.groupId;
      labelGroupName.value = ctx.groupName;
    }
  }
  showLabelArtistsSection.value = true;
  if (!useDropdownArtistList.value) {
    artistsDropdownOpen.value = false;
  }
}

/**
 * Вызов из fetchUserData Menu / Header после ответа getData.
 */
export function syncLabelMenuFromGetDataResponse(
  data: Record<string, unknown> | null | undefined
) {
  if (!data) return;
  const u = data.user as Record<string, unknown> | undefined;
  if (u) {
    const uid = u.id;
    bitrixUserId.value =
      uid != null && uid !== "" ? String(uid) : "";
    labelMenuUserLogin.value = String(u.login ?? "");
  } else {
    bitrixUserId.value = "";
    labelMenuUserLogin.value = "";
  }
  if (data.profile) {
    syncLabelFromProfile(
      data.profile as Record<string, unknown>,
      u ?? null
    );
  }
  const storedRet = readStoredLabelReturnUserId();
  if (
    storedRet &&
    bitrixUserId.value &&
    String(storedRet) === String(bitrixUserId.value)
  ) {
    clearStoredLabelReturnUserId();
  }
  refreshLabelArtists();
}

export type LabelShellGetDataPayload = Record<string, unknown>;

const externalRefreshFns = new Set<
  (prefetched?: LabelShellGetDataPayload) => Promise<void>
>();

export function registerLabelArtistsExternalRefresh(
  fn: (prefetched?: LabelShellGetDataPayload) => Promise<void>
): () => void {
  externalRefreshFns.add(fn);
  return () => externalRefreshFns.delete(fn);
}

async function runExternalRefreshes(prefetched?: LabelShellGetDataPayload) {
  await Promise.all(
    [...externalRefreshFns].map((f) =>
      f(prefetched).catch(() => {
        /* ignore */
      })
    )
  );
}

export function toggleArtistsDropdown() {
  artistsDropdownOpen.value = !artistsDropdownOpen.value;
}

export async function openArtistCabinet(id: string) {
  if (artistCabinetSwitching.value) return;
  artistsDropdownOpen.value = false;
  if (!/^\d+$/.test(id)) {
    router.push(Tr.i18nRoute({ name: "personal", query: { artist: id } }));
    return;
  }
  if (apiIsLabel.value && bitrixUserId.value) {
    try {
      sessionStorage.setItem(LABEL_RETURN_USER_SS, String(bitrixUserId.value));
      labelReturnUserId.value = String(bitrixUserId.value);
      writeStoredLabelGroupRoster(labelArtists.value);
      writeStoredLabelContext({
        groupId: labelGroupId.value,
        groupName: labelGroupName.value,
      });
    } catch {
      /* ignore */
    }
  }
  artistCabinetSwitching.value = true;
  try {
    await postUrlEncodedRequest(AUTH_LABEL_USER_URL, { ID: id });
    const response = await sendRequest(
      "get",
      "/ajax_vue/ajax/getData.php",
      {}
    );
    const data = response?.data as LabelShellGetDataPayload | undefined;
    if (!data) {
      throw new Error("empty getData after auth");
    }
    syncLabelMenuFromGetDataResponse(data);
    await runExternalRefreshes(data);
    await router.replace(Tr.i18nRoute({ name: "personal" }));
  } catch {
    alert("Не удалось перейти в кабинет артиста. Повторите попытку.");
  } finally {
    artistCabinetSwitching.value = false;
  }
}

export function openAddArtistModal() {
  addArtistError.value = "";
  newArtistPseudonym.value = "";
  addArtistModalOpen.value = true;
  artistsDropdownOpen.value = false;
}

export function closeAddArtistModal() {
  addArtistModalOpen.value = false;
  addArtistError.value = "";
}

export async function submitNewArtist() {
  addArtistError.value = "";
  const artistName = newArtistPseudonym.value.trim();
  if (!artistName) {
    addArtistError.value = "Введите псевдоним.";
    return;
  }

  if (!apiIsLabel.value && !viewingArtistAsLabelManager.value) {
    const login = labelMenuUserLogin.value.trim().toLowerCase();
    if (login && artistName.trim().toLowerCase() === login) {
      addArtistError.value =
        "Укажите другой псевдоним, отличный от вашего логина — так вы добавите артиста и перейдёте в формат лейбла.";
      return;
    }
  }

  const lable = labelGroupId.value;
  const nameLable = labelGroupName.value;
  if (!lable || lable === 0 || lable === "" || !nameLable) {
    addArtistError.value =
      "Нет группы лейбла (нужна группа Bitrix с ID > 4 в вашем аккаунте и имя группы в профиле). Обновите страницу или обратитесь в поддержку.";
    return;
  }

  addArtistSubmitting.value = true;
  try {
    const response = await postUrlEncodedRequest(ADD_LABEL_USER_URL, {
      LABLE: lable,
      nameLable,
      NEW_USER_LABLE: artistName,
    });

    const parsed = parseAddLableUserPhpResponse(response.data);
    if (!parsed.ok) {
      addArtistError.value = parsed.message;
      return;
    }

    await runExternalRefreshes();
    closeAddArtistModal();
  } catch {
    addArtistError.value = "Ошибка сети. Повторите попытку.";
  } finally {
    addArtistSubmitting.value = false;
  }
}

function onDocumentClick(e: MouseEvent) {
  if (!artistsDropdownOpen.value) return;
  const el = artistsRootRef.value;
  if (el && e.target instanceof Node && !el.contains(e.target)) {
    artistsDropdownOpen.value = false;
  }
}

let docClickRegistrations = 0;

export function labelArtistsMenuAttachDocumentClick() {
  if (typeof document === "undefined") return;
  if (docClickRegistrations++ === 0) {
    document.addEventListener("click", onDocumentClick);
  }
}

export function labelArtistsMenuDetachDocumentClick() {
  if (typeof document === "undefined") return;
  if (--docClickRegistrations <= 0) {
    docClickRegistrations = 0;
    document.removeEventListener("click", onDocumentClick);
  }
}
