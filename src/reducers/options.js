import Immutable from 'immutable'

function setOptions ({ state, type, options }) {
  const optionsObj = {}
  optionsObj[type] = options
  return state.mergeIn(['options'], optionsObj)
}

import { actionReducer } from './utils'

const initialState = Immutable.fromJS({ options: {
  consoleOptions: {},  // It contains vmId: { autoConnect: boolean }
} })

const options = actionReducer(initialState, {
  SET_CONSOLE_OPTIONS (state, { payload: { vmId, options } }) {
    const optionsTemp = {}
    optionsTemp[vmId] = options
    return setOptions({ state, type: 'consoleOptions', options: optionsTemp })
  },
})

export default options
