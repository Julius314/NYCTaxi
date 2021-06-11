import keplerGlReducer from 'kepler.gl/reducers';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {taskMiddleware} from 'react-palm/tasks';

const customizedKeplerGlReducer = keplerGlReducer
  .initialState({
    uiState: {
      // hide side panel to disallow user customize the map
      readOnly: true,

      // customize which map control button to show
      mapControls: {
        visibleLayers: {
          show: false,
        },
        mapLegend: {
          show: true,
          active: false
        },
        toggle3d: {
          show: false
        },
        splitMap: {
          show: false
        }
      }
    }
  });

const reducer = combineReducers({
    // <-- mount kepler.gl reducer in your app
    keplerGl: customizedKeplerGlReducer,
  
    // Your other reducers here
    //app: appReducer
  });
  
const store = createStore(reducer, {}, applyMiddleware(taskMiddleware));

export default store;