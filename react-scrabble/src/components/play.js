import React,{ useState, useEffect }  from 'react'
import { useLocation } from 'react-router'
import { useHistory } from 'react-router-dom'

const Play = () => {
    // Parameters passed from homepage
    const location = useLocation()
    
    const [letters, setLetters] = useState({rack:[], answer:[]})
    const [inputVal, setInputVal] = useState('')
    const [dict, setDict] = useState({})
    const [userInfo, setUserInfo] = useState({username: '', sets: [{'score': "Not Logged In"}]})

    // To track the set in the userInfo and not have to perform a linear search multiple times to find the same set
    const [lettersIndex, setLettersIndex] = useState(0)
    
    // Next Four useStates are for alertDiv visibility, content and color
    const [alertDiv, setAlertDiv] = useState('row mt-5 invisible')
    const [wordFound, setWordFound] = useState('')
    const [definition, setDefinition] = useState('')
    const [alertColor, setAlertColor] = useState("alert alert-danger col-12 col-sm-6")
    
    
    // Redirect if location fails to load
    let history = useHistory()
        if (location.state === undefined){
            history.push('/')
        }

    // Initialization
    useEffect(() => { 
        if (location.state !== undefined){
            setLetters({...letters, rack:location.state.letters.split('')})
            setDict(location.state.info.dictionary)

            // Fetching userInfo
            fetch("https://scrabbleapi.elvnosix.com/userInfo", {credentials:'include'}).then(res => res.json())
            .then(obj => {
                // This trick of directly modifying the object then calling setUserInfo is explained in lines 82-96
                userInfo.username = obj.username
                userInfo.sets = obj.sets
                setUserInfo({...userInfo})
            
                // Searching for the needed set once and saving the index to access that set in constant time later 
                for (let index = 0; index < userInfo.sets.length; index++) {
                    if (userInfo.sets[index].letters === location.state.info.letters){
                        setLettersIndex(index)
                        break
                    }
            }
            }).catch(e => console.log(e)) 
        }
    }, [])

    // Checks the submitted word against the dictionary
    const HandleSubmit = (e) =>{
        e.preventDefault();
        const word = letters.answer.join('')
        if (word.length === 0){
            // Toggling alert
            setWordFound("No word submitted")
            setDefinition("Please click on the letters to form a word.")
            setAlertColor("alert alert-warning col-12 col-sm-6")
            setAlertDiv('row mt-5 visible')
        }
        else if (word.length === 1){
            // Toggling alert
            setWordFound(word.toUpperCase())
            setDefinition("One-letter words are not accepted in Scrabble. Please Try again.")
            setAlertColor("alert alert-warning col-12 col-sm-6")
            setAlertDiv('row mt-5 visible')
        }
        else if (word in dict){
            // Toggling alert
            setWordFound(word.toUpperCase())
            setDefinition(dict[word])
            setAlertColor("alert alert-success col-12 col-sm-6")
            setAlertDiv('row mt-5 visible')
            
            // Sending a POST request to Django to update userInfo
            const data = new FormData()
            data.append('letterSet', location.state.letters)
            data.append('found', word)
            data.append('total', Object.keys(dict).length)
            fetch('https://scrabbleapi.elvnosix.com/found', {
                method: 'POST',
                credentials:'include',
                body: data,
                headers: {
                    'mode':'cors',
                    // This insane regex is obviously straight from stackoverflow, as no regular mortal being can do this
                    // Basically it grabs the csrf token from the browser cookies
                    'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1")
                }
            }).then(res => {if (res.ok){
                return res.json()
            }}).then(obj => {
                // Same trick as in other comments, updating score
                userInfo.sets[lettersIndex].score = obj.score
                setUserInfo({...userInfo})
            }).catch(e => console.log(e))
        } else {
            // Toggling alert
            setWordFound(word.toUpperCase())
            setDefinition("This word is not accepted in Scrabble. Please try again")
            setAlertColor("alert alert-warning col-12 col-sm-6")
            setAlertDiv('row mt-5 visible')
        }

        // Resetting answer rack
        while (letters.answer.length > 0){
            HandleDelete()
        }
    }
            
    // Shuffles lettersDisplay
    const shuffle = () =>{
        // Spreading the array is necessary because shuffling it in place does not re-render, as it is considered the same object
        setLetters({...letters, rack:[...letters.rack.sort(function() {return 0.5 - Math.random()})]})
    }

    // Takes the clicked letter from rack and puts it in answer in the letters state
    const HandleClickRack = (b) => {
        // button id is 'rack#' where # is the index, so charAt(4) always returns the index
        var index = parseInt(b.target.id.charAt(4))
        
        // What's happening here is a little hacky (but also looks kind of elegant in some way in my opinion lol).
        // Updating letters state inside setLetters() led to all sorts of problems; letters.answer was updating
        // correctly but always one step behind (one call of HandleClickRack() behind to be more precise), while
        // letters.rack was updating twice for each call of the function and somehow changed the whole rack to become
        // the clicked letter only. My guess is that it may have to do with how closure works in JavaScript, combined 
        // with the fact that I was spreading the letters object inside setLetters() and then used methods that modified 
        // the already existing object inside setLetters instead of assigning a new value. This may have triggered the 
        // update once for the value assigniment and then a second time because of the in-place modification. Of course, 
        // all that may be complete non-sense and I have no idea what's happening.
        // The solution below is directly updating the letters object using methods that modify it in-place, then calling
        // setLetters({...letters}) without changing anything to trigger the re-render and "officially" set the state.
        letters.answer.push(letters.rack[index]) // Adding the clicked letter to answer
        letters.rack.splice(index, 1) // Removing the clicked letter from rack
        // Spreading is mandatory, otherwise JS does not recognize the change as the object itself would remain "the same"
        setLetters({...letters}) // "Officially" setting the state and triggering the re-render

        // Showing the clicked letter in the input field
        setInputVal(letters.answer.join(''))
    }

    // Handles Delete button click
    const HandleDelete = () => {
        if (letters.answer.length > 0){
            // Same trick as in HandleClickRack: update letters using methods that modify it in place, then call
            // setLetters({...letters}) without any changes to officially set the state and re-render.
            letters.rack.push(letters.answer.pop())
            setLetters({...letters})

            // Showing the clicked letter in the input field
            setInputVal(letters.answer.join(''))
        }
    }
    
    // Dynamically updates score or prompts login
    const Score = () => {
        // If logged in
        if (userInfo.sets){
            return <small>{userInfo.sets[lettersIndex].score}</small>
        }
        else{
            return <small>Not Logged In</small>
        }
    }

    // Used for rack id and keys
    var i = 0

    return (
        <div className='container-sm bg-light' style={{minHeight:'100vh'}}>

            <div className='row pt-4 mb-2' style={{height: '100px'}}>
                <h1>Find all the possible words!</h1>
            </div>

            <div className='row'>
                <div className='col-sm-2'></div>{/* For alignment */}
                <div className='col-6 col-sm-4'>
                    {/* The score is dynamically updated by the function Score() */}
                    <h5>Words Found: {Score()}</h5>
                </div>
                <div className='col-6 col-sm-4'>
                    {/* The total number of words is the length of the dict object */}
                    <h5>Total Words: {Object.keys(dict).length}</h5>
                </div>
                <div className='col-sm-2'></div>{/* For alignment */}
            </div>

            <form onSubmit={(e) => HandleSubmit(e)}>
                <div className='d-sm-flex flex-row justify-content-center align-items-center'>
                    <div className='flex-column'>
                        <div>
                            {/* This is readOnly so that users cannot type letters that are not part of the rack */}
                            <input className='form-control mb-2' type='text' id='letters' name='letters' 
                                // Inputs must have an onChange attribute set up this way when using useState in the input
                                value={inputVal.toUpperCase()} onChange={(event) => setInputVal(event.target.value)} 
                                minLength='2' maxLength='7' required readOnly>
                            </input>
                        </div>
                    </div>
                    <div className='flex-column'>
                        <div className='flex-row'><button className='btn btn-success mt-3 ms-2' type='submit'>Try</button></div>
                        {/* For alignment */}
                        <div className='flex-row'><button className='btn btn-success mb-1 ms-2 invisible' type='button'></button></div>
                    </div>
                </div>     
            </form>

            <div className='mt-3'>
                {
                    // Dynamically generating the rack using the map method on letters.rack and creating a button for each element
                    letters.rack.map(l => {
                        var id = 'rack' + i
                        i += 1
                        return  <button type='button' id={id} key={i} className='btn btn-lg btn-outline-primary m-2' onClick={(b) => HandleClickRack(b)}>
                                    {l.toUpperCase()}
                                </button>
                        }
                    )
                }
                {/* Delete button */}
                <button type='button' className='btn btn-lg btn-outline-danger m-2' onClick={() => HandleDelete()}>{"<-"}</button>
            </div>

            <div className='flex-row'>
                {/* Shuffle letters */}
                <button className='btn btn-secondary btn float-center mt-4' type='button' onClick={() => shuffle()}>Shuffle letters</button>
            </div>
            
            {/* Alert Div, class name with visible and invisible attribute changes dynamically */}
            <div className={alertDiv}>
                <div className='col-3'></div>{/* For alignment */}
                    <div className={alertColor} role="alert">
                        <button type='button' className='btn-close float-end' onClick={() => setAlertDiv('row mt-4 invisible')} aria-label='Close'></button>
                        <div>
                            <h5>{wordFound}</h5>
                            <hr/>
                            <p style={{textAlign:'justify'}}>{definition}</p>
                        </div>
                                                    
                    </div>
                <div className='col-3'></div>{/* For alignment */}
            </div>
            
        </div>
    )}
    
export default Play