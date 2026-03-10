/**
 * MaterialPage Component
 * Main container for Material module routing
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MaterialList from '../components/MaterialList';
import MaterialDetail from '../components/MaterialDetail';
import MaterialForm from '../components/MaterialForm';

const MaterialPage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<MaterialList />} />
      <Route path="new" element={<MaterialForm mode="create" />} />
      <Route path=":id" element={<MaterialDetail />} />
      <Route path=":id/edit" element={<MaterialForm mode="edit" />} />
    </Routes>
  );
};

export default MaterialPage;
