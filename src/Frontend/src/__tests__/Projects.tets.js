import {describe, it} from "@jest/globals";

jest.dontMock('../action/Projects');
import  * as actions from '../action/Projects';
import  * as actionsConstants from '../dispatcher/ProjectActionConstants';
jest.mock('axios');
import axios from 'axios';
jest.mock('../dispatcher/Dispatcher');
import dispatcher from "../dispatcher/Dispatcher";

describe('Testing Project Actions', () => {
    const projects = [
        {
            "id": "616d1fe63874451c55ad21dd",
            "title": "Project1",
            "owner": "User1",
            "members": [],
            "tasks": []
        },
        {
            "id": "616d1fe63874451c55ad21de",
            "title": "Project2",
            "owner": "User2",
            "members": [],
            "tasks": []
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches projects and dispath them', async () => {
        // given
        axios.get.mockReturnValue(Promise.resolve({data: projects}));
        const expectedDispatchedEvent = {
            action: actionsConstants.refreshProjects,
            payload: projects
        };
        // when
        await actions.fetchAllProjects();
        // then
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(dispatcher.dispatch).toBeCalledTimes(1);
        expect(dispatcher.dispatch).toHaveBeenCalledWith(expectedDispatchedEvent);
    });

    it('fetches projects with error', async () => {
        // given
        axios.get.mockReturnValue(Promise.reject());
        // when
        await actions.fetchAllProjects();
        // then
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(dispatcher.dispatch).toHaveBeenCalledTimes(0);
    });
});