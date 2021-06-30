import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'

const Records = () => {
    const [userInfo, setUserInfo] = useState({username: '', sets: [{'': null}]})

    // To trigger re-render and refreshing data if sets are removed
    const [refetch, setRefetch] = useState(true) // Will just alternate between true and false

    // For routing and navigation
    let history = useHistory()

    // Fetching userInfo
    useEffect(() => {
        fetch("https://scrabbleapi.elvnosix.com/userInfo", {credentials:'include'}).then(res => res.json())
        .then(obj => {setUserInfo(obj)}).catch(e => console.log(e))
    }, [refetch])

    // Prompts login if not logged in
    const promptLogin = () =>{
        if (userInfo === {} || 'notFound' in userInfo || userInfo.username === ''){
            return <h3 key='prompt'>You must login to save progress</h3>}
            else{
                return <h2 key='continue' >Continue Play</h2>
            }
    }

    // Fetches the dictionary and redirects to play page
    const HandleClick = (a) =>{
        a.preventDefault()
        // Fetching the dictionary from django
        fetch("https://scrabbleapi.elvnosix.com/play?letters=" + a.target.id, {credentials:'include'}).then(res => res.json())
        .then(obj => {
            // Redirecting to play page
            history.push('/play', {letters:a.target.id, info:obj})
        }).catch(e => console.log(e))
    }

    // Deletes a set from records
    const HandleDelete = (b) => {
        // id is 'del#######' where '########' is the letterset
        let toDelete = b.target.id.substring(3)
        fetch('https://scrabbleapi.elvnosix.com/remove/' + toDelete, {
            method:'DELETE', 
            credentials:'include', 
            headers: {
                'mode':'cors',
                // This insane regex is obviously straight from stackoverflow, as no regular mortal being can do this
                // Basically it grabs the csrf token from the browser cookies
                'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1")
            }}).then(res => {if (res.ok){
                return res.json()}}).then(r => {if (r.removed){
                    setRefetch(!refetch) // Triggering the useEffect dependent on refetch
                }}).catch(e => alert('Error: could not remove'))
    }

    return (
        <div className='container-sm mt-5'>
            {promptLogin()}
            <div className='row'>
                <div className='col-3'></div>{/* For alignment */}

                <div className='list-group col-12 col-sm-6 '>
                    {userInfo.sets && userInfo.sets.map(set => {
                        // Dynamically generates list of sets from userInfo
                        return (<div key={set.letters} className='list-group=item list-group-item-action border p-2'>
                                    <div className='row'>
                                        <div className='d-flex col-11 justify-content-between'>
                                            <a href='#' onClick={(a) => HandleClick(a)} id={set.letters} >
                                                <h5 id={set.letters} className='mb-1'>{set.letters}</h5>
                                            </a>
                                            <small>{set.progress}%</small>
                                        </div>
                                        <div className='col-1'>
                                            <button type='button' id={'del' + set.letters} onClick={(b) => HandleDelete(b)} className='btn-close float-end' aria-label='Close'></button>
                                        </div>
                                    </div>
                                    
                                </div> )
                            }
                        )
                    }
                </div>

                <div className='col-3'></div>{/* For alignment */}
            </div>
        </div>
    )
}

export default Records