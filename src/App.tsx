import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import Entrainement from './pages/Entrainement'
import FichePage from './pages/FichePage'
import MonDiscours from './pages/MonDiscours'
import Plus from './pages/Plus'
import Reecrire from './pages/Reecrire'
import Rubrique from './pages/Rubrique'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/avant" element={<Rubrique type="avant" />} />
        <Route path="/avant/:id" element={<FichePage type="avant" />} />
        <Route path="/produits" element={<Rubrique type="produit" />} />
        <Route path="/produits/:id" element={<FichePage type="produit" />} />
        <Route path="/objections" element={<Rubrique type="objection" recherche />} />
        <Route path="/objections/:id" element={<FichePage type="objection" />} />
        <Route path="/entrainement" element={<Entrainement />} />
        <Route path="/plus" element={<Plus />} />
        <Route path="/mon-discours" element={<MonDiscours />} />
        <Route path="/reecrire" element={<Reecrire />} />
        <Route path="*" element={<Navigate to="/avant" replace />} />
      </Route>
    </Routes>
  )
}
