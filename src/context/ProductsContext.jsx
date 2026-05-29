import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { productsListData } from "../data/productsData";
import { dashboardProducts } from "../data/dashboardData";


const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(productsListData);
  const [dashboardItems, setDashboardItems] = useState(dashboardProducts);

  const addProductFromForm = useCallback((formValues) => {
    setProducts((prevProducts) => {
      const newProduct = mapFormToListProduct(formValues, prevProducts);

      setDashboardItems((prevDashboard) => [
        mapFormToDashboardProduct(formValues, prevDashboard, newProduct.id),
        ...prevDashboard,
      ]);

      return [newProduct, ...prevProducts];
    });
  }, []);

  const value = useMemo(
    () => ({
      products,
      dashboardItems,
      addProductFromForm,
    }),
    [products, dashboardItems]
  );

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }

  return context;
}
