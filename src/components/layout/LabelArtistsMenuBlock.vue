<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import {
  showLabelArtistsSection,
  showStandaloneAddArtist,
  artistsDropdownOpen,
  labelArtists,
  apiIsLabel,
  viewingArtistAsLabelManager,
  bitrixUserId,
  addArtistModalOpen,
  newArtistPseudonym,
  addArtistError,
  addArtistSubmitting,
  artistCabinetSwitching,
  artistsRootRef,
  toggleArtistsDropdown,
  openArtistCabinet,
  openAddArtistModal,
  closeAddArtistModal,
  submitNewArtist,
  isLabelAccountRow,
  labelArtistsMenuAttachDocumentClick,
  labelArtistsMenuDetachDocumentClick,
} from "@/composables/labelArtistsMenu";

withDefaults(
  defineProps<{
    /** false — только блок списка (модалка остаётся у другого экземпляра, напр. в боковом Menu) */
    includeModal?: boolean;
    /** Доп. класс на корне (бургер: уже без боковых отступов контейнера) */
    rootClass?: string;
  }>(),
  { includeModal: true, rootClass: "" }
);

const inputId = `label-new-artist-${Math.random().toString(36).slice(2, 10)}`;

let detachDoc: (() => void) | undefined;

onMounted(() => {
  labelArtistsMenuAttachDocumentClick();
  detachDoc = () => labelArtistsMenuDetachDocumentClick();
});

onUnmounted(() => {
  detachDoc?.();
});
</script>

<template>
  <div
    v-if="showLabelArtistsSection"
    ref="artistsRootRef"
    class="menu__artists"
    :class="rootClass"
  >
    <button
      v-if="showStandaloneAddArtist"
      type="button"
      class="menu__artists_add menu__artists_add_standalone"
      @click="openAddArtistModal"
    >
      Добавить артиста
    </button>
    <template v-else>
      <button
        type="button"
        class="menu__artists_button"
        :class="{ menu__artists_button_open: artistsDropdownOpen }"
        @click.stop="toggleArtistsDropdown"
      >
        <span class="menu__artists_button_text">Список артистов</span>
        <span class="menu__artists_chevron" aria-hidden="true">▼</span>
      </button>
      <Transition name="label-artists-dd">
        <div v-if="artistsDropdownOpen" class="menu__artists_dropdown">
          <ul v-if="labelArtists.length" class="menu__artists_list">
            <li v-for="a in labelArtists" :key="a.id" class="menu__artists_item">
              <button
                type="button"
                class="menu__artists_row"
                :class="{
                  menu__artists_row_label: isLabelAccountRow(a.id),
                  menu__artists_row_current:
                    String(a.id) === bitrixUserId && !isLabelAccountRow(a.id),
                }"
                :disabled="artistCabinetSwitching"
                @click="openArtistCabinet(a.id)"
              >
                <span class="menu__artists_row_text">{{ a.pseudonym }}</span>
                <span v-if="isLabelAccountRow(a.id)" class="menu__artists_badge">лейбл</span>
              </button>
            </li>
          </ul>
          <button
            v-if="apiIsLabel || viewingArtistAsLabelManager"
            type="button"
            class="menu__artists_add"
            @click="openAddArtistModal"
          >
            Добавить артиста
          </button>
        </div>
      </Transition>
    </template>
  </div>

  <Teleport v-if="includeModal" to="body">
    <div
      v-if="addArtistModalOpen"
      class="menu__artist_modal_overlay"
      @click.self="closeAddArtistModal"
    >
      <div
        class="menu__artist_modal"
        role="dialog"
        aria-labelledby="label-artist-modal-title"
      >
        <div class="menu__artist_modal_header">
          <h5 id="label-artist-modal-title" class="menu__artist_modal_title">
            Новый артист
          </h5>
          <button
            type="button"
            class="menu__artist_modal_close"
            @click="closeAddArtistModal"
          >
            ×
          </button>
        </div>
        <div class="menu__artist_modal_body">
          <label class="menu__artist_modal_label" :for="inputId"
            >Псевдоним</label
          >
          <input
            :id="inputId"
            v-model="newArtistPseudonym"
            type="text"
            class="menu__artist_modal_input"
            autocomplete="off"
            placeholder="Введите псевдоним"
            @keydown.enter.prevent="submitNewArtist"
          />
          <p v-if="addArtistError" class="menu__artist_modal_error">
            {{ addArtistError }}
          </p>
          <button
            type="button"
            class="menu__artist_modal_submit button button__primary"
            :disabled="addArtistSubmitting"
            @click="submitNewArtist"
          >
            <span>{{ addArtistSubmitting ? "Отправка…" : "Создать" }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.menu__artists {
  position: relative;
  z-index: 5;
  padding: 0 20px 15px 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 15px;
}

.menu__artists.menu__artists--burger {
  padding-left: 0;
  padding-right: 0;
  margin-bottom: 12px;
}

.menu__artists--burger .menu__artists_dropdown {
  left: 0;
  right: 0;
}

/* В бургере панель с overflow-y: auto — выпадашка в потоке, не обрезается */
.menu__artists--burger-inline .menu__artists_dropdown {
  position: static;
  padding-top: 8px;
}

.menu__artists_button {
  display: flex;
  width: 100%;
  padding: 12px 15px;
  align-items: center;
  gap: 10px;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 30px;
  transition: border-color 0.15s linear;
  cursor: pointer;
  font-size: 14px;
}

.menu__artists_button:hover,
.menu__artists_button_open {
  border-color: var(--text);
}

.menu__artists_button_text {
  flex: 1;
  min-width: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu__artists_chevron {
  flex-shrink: 0;
  font-size: 9px;
  line-height: 1;
  opacity: 0.7;
  transition: transform 0.4s cubic-bezier(0.77, 0, 0.175, 1);
}

.menu__artists_button_open .menu__artists_chevron {
  transform: rotate(180deg);
}

.menu__artists_dropdown {
  position: absolute;
  left: 20px;
  right: 20px;
  top: calc(100% - 8px);
  padding-top: 8px;
  z-index: 20;
}

/* Плавное раскрытие вниз — та же кривая и длительность, что у .burger__menu */
.label-artists-dd-enter-active,
.label-artists-dd-leave-active {
  transition:
    opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1),
    max-height 0.4s cubic-bezier(0.77, 0, 0.175, 1),
    transform 0.4s cubic-bezier(0.77, 0, 0.175, 1);
  overflow: hidden;
}

.label-artists-dd-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.label-artists-dd-enter-to {
  opacity: 1;
  max-height: 520px;
  transform: translateY(0);
}

.label-artists-dd-leave-from {
  opacity: 1;
  max-height: 520px;
  transform: translateY(0);
}

.label-artists-dd-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}

.menu__artists_list {
  list-style: none;
  margin: 0 0 8px 0;
  padding: 6px 0;
  max-height: 220px;
  overflow-y: auto;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.06),
    0 2px 4px rgba(0, 0, 0, 0.04);
}

.menu__artists_item {
  margin: 0;
}

.menu__artists_row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.12s linear;
}

.menu__artists_row_text {
  min-width: 0;
  flex: 1;
  text-align: left;
}

.menu__artists_badge {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: 6px;
  color: #c0392b;
  background: rgba(192, 57, 43, 0.14);
}

.menu__artists_row_label {
  border-left: 3px solid #c0392b;
  padding-left: 11px;
  margin-left: 0;
  background: rgba(192, 57, 43, 0.07);
}

.menu__artists_row_label:hover {
  background: rgba(192, 57, 43, 0.11);
}

.menu__artists_add_standalone {
  border-radius: 30px;
  border-style: solid;
  font-weight: 500;
}

.menu__artists_row:hover {
  background-color: var(--bg-color);
}

.menu__artists_row:disabled {
  opacity: 0.55;
  cursor: wait;
  pointer-events: none;
}

.menu__artists_row_current {
  color: var(--text-muted, #888);
}

.menu__artists_add {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background-color: var(--bg);
  color: var(--text);
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.12s linear,
    background-color 0.12s linear;
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.06),
    0 2px 4px rgba(0, 0, 0, 0.04);
}

.menu__artists_add:hover {
  border-color: var(--text);
  background-color: var(--bg-color);
}

.menu__artist_modal_overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.45);
}

.menu__artist_modal {
  width: 100%;
  max-width: 400px;
  background-color: var(--bg);
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.menu__artist_modal_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}

.menu__artist_modal_title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.menu__artist_modal_close {
  border: none;
  background: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0 4px;
}

.menu__artist_modal_body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu__artist_modal_label {
  font-size: 13px;
  color: var(--text-secondary);
}

.menu__artist_modal_input {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background-color: var(--bg);
  color: var(--text);
  box-sizing: border-box;
}

.menu__artist_modal_input:focus {
  outline: none;
  border-color: var(--text);
}

.menu__artist_modal_error {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #c0392b;
}

.menu__artist_modal_submit {
  margin-top: 4px;
  align-self: flex-start;
}
</style>
