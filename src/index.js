import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import Map from './components/Map'
import SideView from './components/SideView'
import store from './reducer/store'
import './components/global'

render(
  <Provider store={store}>
    <React.Fragment>
      <Map />
      <SideView />
    </React.Fragment>
  </Provider>,
  document.getElementById('root')
)

