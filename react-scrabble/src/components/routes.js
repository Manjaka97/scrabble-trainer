import React from 'react'
import { Route, Switch } from 'react-router'

import Home from './trainer'
import Play from './play'

const Routes = () =>{
    return (
        <div>
            <Switch>
                <Route exact path='/'>
                    <Home />
                </Route>
                <Route exact path='/play'>
                    <Play />
                </Route>
                {/* Anything else will route to Home */}
                <Route path='/'>
                    <Home />
                </Route>
            </Switch>
        </div>
    )
}

export default Routes