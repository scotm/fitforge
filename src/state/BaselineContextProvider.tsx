"use client";
import { createContext, useEffect, useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";

type Category = RouterOutputs["categories"]["getAll"]["items"][number];
type Muscle = RouterOutputs["muscles"]["getAll"]["items"][number];

interface BaselineContextValue {
  categories: Map<number, Category>;
  muscles: Map<number, Muscle>;
  hasLoaded: boolean;
}

const BaselineContext = createContext<BaselineContextValue>({
  categories: new Map(),
  muscles: new Map(),
  hasLoaded: false,
});

type Properties = {
  children: React.ReactNode;
};

const BaselineProvider: React.FC<Properties> = ({ children }) => {
  const categoriesQuery = api.categories.getAll.useQuery(
    {},
    {
      select: (data) =>
        new Map(data.items.map((category) => [category.id, category])),
    },
  );
  const musclesQuery = api.muscles.getAll.useQuery(
    {},
    {
      select: (data) =>
        new Map(data.items.map((muscle) => [muscle.id, muscle])),
    },
  );
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(!categoriesQuery.isLoading && !musclesQuery.isLoading);
  }, [categoriesQuery.isLoading, musclesQuery.isLoading]);

  return (
    <BaselineContext.Provider
      value={{
        categories: categoriesQuery.data ?? new Map<number, Category>(),
        muscles: musclesQuery.data ?? new Map<number, Muscle>(),
        hasLoaded,
      }}
    >
      {children}
    </BaselineContext.Provider>
  );
};

export { BaselineContext, BaselineProvider };
