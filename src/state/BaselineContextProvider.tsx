"use client";
import { createContext, useEffect, useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";

interface BaselineContextValue {
  categories: RouterOutputs["categories"]["getAll"]["items"];
  muscles: RouterOutputs["categories"]["getAll"]["items"];
  hasLoaded: boolean;
}

const BaselineContext = createContext<BaselineContextValue>({
  categories: [],
  muscles: [],
  hasLoaded: false,
});

type Properties = {
  children: React.ReactNode;
};

const BaselineProvider: React.FC<Properties> = ({ children }) => {
  const categoriesQuery = api.categories.getAll.useQuery({});
  const musclesQuery = api.muscles.getAll.useQuery({});
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(!categoriesQuery.isLoading && !musclesQuery.isLoading);
  }, [categoriesQuery.isLoading, musclesQuery.isLoading]);

  return (
    <BaselineContext.Provider
      value={{
        categories: categoriesQuery.data?.items ?? [],
        muscles: musclesQuery.data?.items ?? [],
        hasLoaded,
      }}
    >
      {children}
    </BaselineContext.Provider>
  );
};

export { BaselineContext, BaselineProvider };
