import React, {useState, useEffect} from 'react'

const Navbar = () => {
    const [username, setUsername] = useState('')
    const [href, setHref] = useState("#") // To dynamically set href leading to log in page

    // Dynamically sets username on navbar
    useEffect(() => {
        fetch('https://scrabbleapi.elvnosix.com/username', {credentials:'include'}).then(res => res.json()).then(r => {
            if (r.username){
                setUsername(r.username + ' | Log Out')
                // Logout if already logged in
                setHref("https://scrabbleapi.elvnosix.com/logout")
            }
            else {
                setUsername("Log in/ Sign up")
                // <a> tag directs to log in page if not logged in
                setHref('https://scrabbleapi.elvnosix.com/login')
            }
        }).catch(() => { setUsername("Log in/ Sign up")
                         // <a> tag directs to log in page if not logged in
                         setHref('https://scrabbleapi.elvnosix.com/login')})
    }, [username])

    return (
        <nav className="navbar navbar-expand-lg navbar-light" style={{backgroundColor: '#30343f'}}>
            <div className="container-fluid">
                <a href='https://scrabble.elvnosix.com/'>
                    <img src={'logo.svg'} alt='logo'></img>
                </a>
                <a href={ href }>{ username }</a>
            </div>
        </nav>
    )
}

export default Navbar