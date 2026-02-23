## RROMIFY transform 2d into 3rd for free - AI architecture
## 19 Feb 2026
## JUNIE
https://www.youtube.com/watch?v=JiwTGGGIhDs

4:50 set up our project
https://vite.dev/
        npm create vite@latest
        5:50 IDE and JUNIE install

7:00 Puter.com : use of it to hanlde all the backend AI for this project
    https://puter.com/?utm_source=jsmastery
    ahmad.vbe@gmail.com
    Username ahmadvbe
        https://docs.puter.com/
            whether you have 1 or 1 million users, you pay nothing for the infrastructure to run your application.
         open source: https://github.com/heyPuter/puter/

9:20 npm run dev 
    https://reactrouter.com/home
    
## 9:30 file and folder structure of the app

## 12:15 NAVBAR
        components/Navbar.tsx

## app.css 14:00

## NABVAR 15:05 
    17:45 CREATE A reusable button component 
      components/ui/Button.tsx
        18:00 HOW TO USE AI TO CREATE THE BUTTON FOR YOU
        18:26 USING  **JUNIE**  
        20:44  going back to components/Navbar.tsx

## 22:45 implementing authentication logic using PUTER  within NAVBAR
 ##   by installting PUTER js 22:54
    puter actions for sign in /up /out
         https://docs.puter.com/Auth/signIn/

         23:05 to do it we first hve to install puter -
          https://docs.puter.com/getting-started/
            npm install @heyputer/puter.js
            23:30. implementing all the actions provided by PUTER 
                lib/puter.action.ts

##            24:45 integrate the puter AUTH within our app 
                by using react router useOutlet Context 
                    https://reactrouter.com/api/hooks/useOutletContext
              CREATE THE ACTION CALL FOR PUTER ACTIONS 27:16   @ app/root.tsx 
              then return so now we can use the following funcs from whichever page we want
##            30:30 components/Navbar.tsx
                destruct the function 

## 34:20 GITHUB push    
        git init
        git add . 
    35:30 coe rabbit integration
        https://app.coderabbit.ai/settings/repositories?code=72700bf53331e325ce43&installation_id=89242342&setup_action=update&utm_medium=influencer&utm_source=youtube&utm_campaign=awareness

## 36:22 UI home PAGE
    app/routes/home.tsx

  
    ## 45:34 PUSH THE CURRENT CHANGES


  ## 46:00 IMPLEMENT THE AI THAT TAKES A BASIC A 2D FLOOR PLAN AND TRANSFORM IT
  create a new branch
    git checkout -b 'upload-files
    components/Upload.tsx 46:29
    import it in the app/routes/home.tsx
    
    //53:45 now we hve to keep track of a lot of diff constants and we dnt wanat to store any info within this component
        //instead lib/constants.ts
                    //MOST IMPORTANT THE ROOMIFY RENDER PROMPT 54:40

   ## 55:55 IMPLEMENT THE ACTUAL DRAG AND DROP UPLOAD LOGIC @ components/Upload.tsx
        USE OF AI TO DO IT FOR US 56:35 ---- 57:30
            changes mainly done at the Upload.tsx file

            59:28 VISUALIZE THE UPLOADED FILE
                app/routes/visualizer.$id.tsx
                Add this new route within  app/routes.ts
            1:00:35 mpdify the onComplete @ the app/routes/home.tsx so we ll hve a    redirection   to this visualizer page just created app/routes/visualizer.$id.tsx
            1:02:30 open up a PR pull request
                push the chnages on this new branch
                    git status
                    git add . 
                    git commit -m 
                    git push --set-upstream origin upload-files
                1:03:50 code rabbit
