import {Box} from "lucide-react";
import Button from "./ui/Button";
import {useOutletContext} from "react-router";
//12:40
const Navbar = () => {
    //20:44
    // const  isSignedIn = false;
    // const userName = 'ahmad';

    //30:30 
     const { isSignedIn, userName, signIn, signOut } = useOutletContext<AuthContext>()

    const handleAuthClick = async () => { //17:00 32:09
        if(isSignedIn) {
            try {
                await signOut();
            } catch (e) {//32:18
                console.error(`Puter sign out failed: ${e}`);
            }

            return; //32:50 exit the above func if the user is signed in
        }

        try {//if we re nt signed in 32:40 sign in logic execution
            await signIn();
        } catch (e) { 
            console.error(`Puter sign in failed: ${e}`);
        }
    };

    return ( //15:05
        <header className="navbar">
            <nav className="inner">
                <div className="left">
                    <div className="brand">
                        <Box  //15:40
                            className="logo" />

                        <span className="name">
                            Roomify
                        </span>
                    </div>

                    <ul //15:58
                        className="links">
                        <a href="#">Product</a>
                        <a href="#">Pricing</a>
                        <a href="#">Community</a>
                        <a href="#">Enterprise</a>
                    </ul>
                </div>

                <div //16:45 
                    className="actions">
                    {isSignedIn ? ( //21:05
                        <>
                            <span className="greeting">
                                {userName ? `Hi, ${userName}` : 'Signed in'}
                            </span>

                            <Button //22:00
                                size="sm" onClick={handleAuthClick} className="btn">
                                Log Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleAuthClick} size="sm" variant="ghost">
                                Log In
                            </Button>

                            <a href="#upload" className="cta">Get Started</a>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Navbar
