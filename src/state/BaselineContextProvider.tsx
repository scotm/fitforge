/* eslint-disable @typescript-eslint/no-empty-function */
"use client";
import { createContext, useEffect, useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";

interface BaselineContextValue {
  categories: RouterOutputs["categories"]["getAll"]["items"];
  muscles: RouterOutputs["categories"]["getAll"]["items"];
  selectedCategory: number;
  setSelectedCategory: React.Dispatch<React.SetStateAction<number>>;
  muscleFilter: number[];
  setMuscleFilter: React.Dispatch<React.SetStateAction<number[]>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  maxPage: number;
  setMaxPage: React.Dispatch<React.SetStateAction<number>>;
  hasLoaded: boolean;
}

const BaselineContext = createContext<BaselineContextValue>({
  categories: [],
  selectedCategory: 0,
  setSelectedCategory: () => {},
  muscles: [],
  muscleFilter: [],
  setMuscleFilter: () => {},
  page: 0,
  setPage: () => {},
  maxPage: 0,
  setMaxPage: () => {},
  hasLoaded: false,
});

type Properties = {
  children: React.ReactNode;
};

const BaselineProvider: React.FC<Properties> = ({ children }) => {
  const categoriesQuery = api.categories.getAll.useQuery({});
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const musclesQuery = api.muscles.getAll.useQuery({});
  const [muscleFilter, setMuscleFilter] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(!categoriesQuery.isLoading && !musclesQuery.isLoading);
  }, [categoriesQuery.isLoading, musclesQuery.isLoading]);

  useEffect(() => {
    setPage(0);
  }, [selectedCategory]);

  return (
    <BaselineContext.Provider
      value={{
        categories: categoriesQuery.data?.items ?? [],
        selectedCategory,
        setSelectedCategory,
        muscles: musclesQuery.data?.items ?? [],
        muscleFilter,
        setMuscleFilter,
        page,
        setPage,
        maxPage,
        setMaxPage,
        hasLoaded,
      }}
    >
      {children}
    </BaselineContext.Provider>
  );
};

export { BaselineContext, BaselineProvider };
