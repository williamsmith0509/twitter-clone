import { AxiosError } from 'axios'
import { ActionTree } from 'vuex'
import { AugmentedActionContext } from '../types'
import { Mutations, MutationTypes } from './mutations'
import { State, UserData } from './state'

import axios from '../../services/axios'

export enum ActionTypes {
  AUTHENTICATE_USER = 'AUTHENTICATE_USER',
  REFRESH_AUTH_TOKEN = 'REFRESH_AUTH_TOKEN',
  GET_USER_DATA = 'GET_USER_DATA',
}

export interface Actions {
  [ActionTypes.AUTHENTICATE_USER](
    { commit }: AugmentedActionContext<Mutations, State>,
    payload: { email: string; password: string }
  ): Promise<void>
  [ActionTypes.REFRESH_AUTH_TOKEN]({
    commit,
  }: AugmentedActionContext<Mutations, State>): Promise<void>
  [ActionTypes.GET_USER_DATA]({
    commit,
  }: AugmentedActionContext<Mutations, State>): Promise<void>
}

export const actions: ActionTree<State, State> & Actions = {
  async [ActionTypes.AUTHENTICATE_USER]({ commit }, payload): Promise<void> {
    try {
      const response = await axios.post<{ access_token: string }>(
        '/auth/login',
        {
          email: payload.email,
          password: payload.password,
        }
      )

      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${response.data.access_token}`

      commit(MutationTypes.SET_ACCESS_TOKEN, response.data.access_token)
      commit(MutationTypes.SET_AUTHENTICATION_STATUS, {
        message: 'Successfully logged in',
        statusCode: response.status,
        isLoggedIn: true,
      })
    } catch (error) {
      commit(MutationTypes.SET_AUTHENTICATION_STATUS, {
        message: error.response.data.message,
        statusCode: error.response.status || 401,
        isLoggedIn: false,
      })
    }
  },
  async [ActionTypes.REFRESH_AUTH_TOKEN]({
    commit,
  }: AugmentedActionContext<Mutations, State>): Promise<void> {
    try {
      const response = await axios.get<{ access_token: string }>('/auth/token')

      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${response.data.access_token}`

      commit(MutationTypes.SET_ACCESS_TOKEN, response.data.access_token)
      commit(MutationTypes.SET_AUTHENTICATION_STATUS, {
        message: 'Successfully logged in',
        statusCode: response.status,
        isLoggedIn: true,
      })
    } catch (error) {
      commit(MutationTypes.SET_AUTHENTICATION_STATUS, {
        message: error.response.data.message,
        statusCode: error.response.status || 401,
        isLoggedIn: false,
      })
    }
  },
  async [ActionTypes.GET_USER_DATA]({
    commit,
  }: AugmentedActionContext<Mutations, State>): Promise<void> {
    try {
      const response = await axios.get('/auth/me')

      commit(MutationTypes.SET_USER_DATA, {
        id: response.data.user_id,
        ...response.data,
      })
    } catch (error) {
      commit(MutationTypes.SET_AUTHENTICATION_STATUS, {
        message: error.response.data.message,
        statusCode: error.response.status || 401,
        isLoggedIn: false,
      })
    }
  },
}
