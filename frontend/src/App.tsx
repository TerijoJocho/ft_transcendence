import './App.css'
import TextSection from './TextSection.tsx'
import LoginSection from './LoginSection.tsx'
import Header from './Header.tsx'


function App() {
  return (
    <>
    <div className="h-screen w-full bg-gray-500 text-white flex flex-col items-center justify-center">
      <Header 
        title={"ChessWar"}
      />

      <TextSection 
        title={"Bienvenue"}
        paragraph={"Ceci est la landing page où il y aura un long texte pour remplir le paragraphe. Je ne sis pas quoi dire mais je dis des choses utile ou inutiles. Nous allons faire un jeu de chess pour que le gens se la foutent mdr. J'ai pensé à un nom: ChessWar la guerre des rois ; pas mal hein? Anyway, je pense que j'ai assez ecris, bye !"}
      />
      <TextSection 
        title={""}
        paragraph={"Connectez-vous vite et découvrez l'art de la GUERRE !"}
      />
      <LoginSection />
    </div>
    </>
  )
}

export default App
