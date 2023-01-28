import type { Tool } from "@/interfaces/Tool";
import { ref, watch, watchPostEffect, type Ref } from "vue";
import { onAction } from "./appActions";
import artboardService from "./artboardService";
import openAiService from "./openAiService";


type StateCollection = { [key: string]: Ref }
type SerailizedStateCollection = { [key: string]: any }

const editorAppState = {
    toolSelected: ref<Tool>('pencil'),

    eraserSize: ref<number>(300),
    snapSize: ref<number>(128),
    pencilColor: ref<string>('#00ff00'),

    settingsPanelVisible: ref<boolean>(false),
    galleryPanelVisible: ref<boolean>(true),
    statusBarVisible: ref<boolean>(true),
    formPanelsVisible: ref<boolean>(true),
    toolbarVisible: ref<boolean>(true),
    menuVisible: ref<boolean>(true),

    // TODO perhaps these should go to panelState objects?
    prompt: ref<string>(''),
    showMetadata: ref<boolean>(false),
    scaleImageBy: ref<number>(0.5),
}


function resetState() {
    console.log('resetState')
    toolSelected.value = 'pencil'
    eraserSize.value = 300
    snapSize.value = 128
    pencilColor.value = '#00ff00'
    settingsPanelVisible.value = false
    galleryPanelVisible.value = true
    statusBarVisible.value = true
    formPanelsVisible.value = true
    toolbarVisible.value = true
    menuVisible.value = true
    prompt.value = ''
    showMetadata.value = false
    scaleImageBy.value = 0.5
}

export const toolSelected = editorAppState.toolSelected
export const eraserSize = editorAppState.eraserSize
export const snapSize = editorAppState.snapSize
export const pencilColor = editorAppState.pencilColor
export const settingsPanelVisible = editorAppState.settingsPanelVisible
export const galleryPanelVisible = editorAppState.galleryPanelVisible
export const statusBarVisible = editorAppState.statusBarVisible
export const formPanelsVisible = editorAppState.formPanelsVisible
export const toolbarVisible = editorAppState.toolbarVisible
export const menuVisible = editorAppState.menuVisible
export const prompt = editorAppState.prompt
export const showMetadata = editorAppState.showMetadata
export const scaleImageBy = editorAppState.scaleImageBy

let loaded = false
watchPostEffect(() => {
    if (!loaded) return
    const collection: StateCollection = editorAppState
    Object.keys(collection).forEach(key => {
        void (collection[key].value)
    })

    saveState()
})

loadState()
function loadState() {
    console.log('loadState')
    openAiService.openApiKey.value = window.localStorage.getItem('openApiKey') || ''
    artboardService.artwork.value.filename = window.localStorage.getItem('filename') || ''
    deserializeStateCollection(editorAppState, window.localStorage.getItem('editorAppState') || '{}')
    loaded = true
}

watch(onAction, action => {
    if (action.action === 'reset') resetState()
})

function saveState() {
    // TODO perhaps bring these in in a better way?
    window.localStorage.setItem('metadata', JSON.stringify(artboardService.artwork.value.metadata))
    window.localStorage.setItem('filename', artboardService.artwork.value.filename)
    window.localStorage.setItem('editorAppState', serializeStateCollection(editorAppState))
    console.log('saveState')
}

function serializeStateCollection(collection: StateCollection) {
    const result: SerailizedStateCollection = {}
    Object.keys(collection).forEach(key => {
        result[key] = collection[key].value
    })
    return JSON.stringify(result)
}

function deserializeStateCollection(collection: StateCollection, value: string) {
    const source: SerailizedStateCollection = JSON.parse(value)
    Object.keys(collection).forEach(key => {
        if (source[key] !== undefined) collection[key].value = source[key]
    })
}
