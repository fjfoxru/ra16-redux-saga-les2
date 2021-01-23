import { takeLatest, put, spawn, debounce, retry } from 'redux-saga/effects';
import { searchSkillsRequest, searchSkillsSuccess, searchSkillsFailure, servicesSuccess, servicesFailure, serviceItemSuccess, serviceItemFailure } from '../actions/actionCreators';
import { CHANGE_SEARCH_FIELD, SEARCH_SKILLS_REQUEST, SERVICES_REQUEST, SERVICE_ITEM_REQUEST } from '../actions/actionTypes';
import { searchSkills, getServices, getItemService } from '../api/index';

function filterChangeSearchAction({type, payload}) {
    return type === CHANGE_SEARCH_FIELD && payload.search.trim() !== ''
}

// worker
function *handleChangeSearchSaga(action) {
    yield put(searchSkillsRequest(action.payload.search));
}

// watcher
function* watchChangeSearchSaga() {
    yield debounce(100, filterChangeSearchAction, handleChangeSearchSaga);
}

// worker
function* handleSearchSkillsSaga(action) {
    try {
        const retryCount = 3;
        const retryDelay = 1 * 1000; // ms
        const data = yield retry(retryCount, retryDelay, searchSkills, action.payload.search);
        yield put(searchSkillsSuccess(data));
    } catch (e) {
        yield put(searchSkillsFailure(e.message));
    }
}

// watcher
function* watchSearchSkillsSaga() {
    yield takeLatest(SEARCH_SKILLS_REQUEST, handleSearchSkillsSaga);
}


// worker
function* handleServicesSaga(action) {
    try {
        const retryCount = 3;
        const retryDelay = 1 * 1000; // ms
        const data = yield retry(retryCount, retryDelay, getServices);
        yield put(servicesSuccess(data));
    } catch (e) {
        yield put(servicesFailure(e.message));
    }
}


// watcher
function* watchServicesSaga() {
    yield takeLatest(SERVICES_REQUEST, handleServicesSaga);
}



// worker
function* handleServiceItemSaga(action) {
    try {
        const retryCount = 3;
        const retryDelay = 1 * 1000; // ms
        const data = yield retry(retryCount, retryDelay, getItemService, action.payload.id);
        yield put(serviceItemSuccess(data));
    } catch (e) {
        yield put(serviceItemFailure(e.message));
    }
}

// watcher
function* watchServiceItemSaga() {
    yield takeLatest(SERVICE_ITEM_REQUEST, handleServiceItemSaga);
}

export default function* saga() {
    yield spawn(watchChangeSearchSaga);
    yield spawn(watchSearchSkillsSaga);
    yield spawn(watchServicesSaga);
    yield spawn(watchServiceItemSaga);
}