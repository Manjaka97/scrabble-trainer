import React, { useState } from 'react'
import { useHistory} from 'react-router-dom'

import Records from './records'

const Train = () => {
    const [inputVal, setInputVal] = useState('')

    // Routing and navigation
    let history = useHistory()

    // Generates 7 random lowercase letters
    const randomLetters = () =>{
        var chars = 'abcdefghijklmnopqrstuvwxyz'
        var res = ''
        for (var i = 0; i < 7; i++){
            res += chars.charAt(Math.floor(Math.random() * 26))
        }
        return res
    }
    
    // Fetches the dictionary and redirects to play page
    const HandleSubmit = (e) =>{
        e.preventDefault();
        // Fetching the dictionary from django
        fetch("https://scrabbleapi.elvnosix.com/play?letters=" + inputVal, {credentials:'include'}).then(res => res.json())
        .then(obj => {
            // Redirecting to play page, sending letters and dictionary in location.state
            history.push('/play', {letters:inputVal, info:obj})
        }).catch(e => console.log(e))
    }

    return (
        <div className='container-sm bg-light' style={{minHeight:'100vh'}}>

            <div className='row pt-4' style={{height: '100px'}}>
                <h1>Scrabble Trainer</h1>
            </div>
            
            <form onSubmit={(e) => HandleSubmit(e)}>
                <div className='d-sm-flex flex-row justify-content-center align-items-center'>
                    <div className='flex-column'>
                        <div>
                            <label className="form-label float-start">Type 7 letters to play</label>
                        </div>
                        <div>
                            <input className='form-control mb-2' type='text' id='letters' name='letters' 
                                // Inputs must have an onChange attribute set up this way when using useState in the input
                                value={inputVal} onChange={(event) => setInputVal(event.target.value)} 
                                minLength='7' maxLength='7' required placeholder='abcdefg'>
                            </input>
                        </div>
                        {/* Random Letter Generator */}
                        <button className='btn btn-secondary btn float-start' type='button' onClick={() => setInputVal(randomLetters())}>Get random letters</button>
                    </div>
                    <div className='flex-column'>
                        <button className='btn btn-success h-50 mb-3 ms-2' type='submit'>Play</button>
                    </div>
                </div>                    
            </form>
            
            {/* Sets the user has played before. User can continue play by clicking on any of the set generated below */}
            <Records/>
        </div>)
}

export default Train