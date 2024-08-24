"use client";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import Markdown from "react-markdown";
import { DEFAULT_PAGE_SIZE } from "@lib/constants";
import { cn } from "@/lib/utils";
import { BaselineContext } from "~/state/BaselineContextProvider";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExercisePagination } from "@/components/ExercisePage/ExercisePagination";

type ExerciseData = {
  exercise: RouterOutputs["exercises"]["getAll"]["items"][number];
};

const Exercise = ({ exercise }: ExerciseData) => {
  return (
    <div>
      <h2 className="text-2xl font-bold">{exercise.name}</h2>
      <Markdown>{exercise.how_to_perform}</Markdown>
      <div className="flex flex-col gap-2">
        <p>Category: {exercise.category}</p>
        <p>Licence: {exercise.licence}</p>
        {exercise.equipment.map((equipment) => (
          <div key={equipment.id} className="flex flex-col gap-2">
            <p>{equipment.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

type ExerciseListProps = {
  selectedCategory: number;
};

const ExerciseList: React.FC<ExerciseListProps> = ({ selectedCategory }) => {
  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(0);
  const { data, error, status, isFetching } = api.exercises.getAll.useQuery(
    {
      page: page,
      categoryId: selectedCategory,
    },
    {
      placeholderData: (p) => {
        if (!p) return undefined;
        return p;
      },
    },
  );

  useEffect(() => {
    if (data?.totalItems && maxPage === 0) {
      setMaxPage(Math.ceil(data.totalItems / DEFAULT_PAGE_SIZE) - 1);
    }
  }, [data]);

  return status === "pending" ? (
    <p>Loading...</p>
  ) : status === "error" ? (
    <p>Error: {error.message}</p>
  ) : (
    <>
      <ExercisePagination setPage={setPage} page={page} maxPage={maxPage} />
      {data.totalItems} items
      <div className={cn(isFetching && "bg-gray-200")}>
        {data.items.map((exercise) => (
          <Exercise key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </>
  );
};

type CategorySelectorProps = {
  setSelectedCategory: Dispatch<SetStateAction<number>>;
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  setSelectedCategory,
}) => {
  const { categories } = useContext(BaselineContext);
  return (
    <Select
      onValueChange={(value) => setSelectedCategory(Number.parseInt(value))}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0">All</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id.toString()}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const ExercisePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  return (
    <div>
      <CategorySelector setSelectedCategory={setSelectedCategory} />
      <ExerciseList selectedCategory={selectedCategory} />
    </div>
  );
};

export default ExercisePage;
