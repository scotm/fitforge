"use client";
import React, { useContext, useEffect } from "react";

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
import { DropdownMenuCheckboxes } from "@/components/DropdownCheckboxes";
import Link from "next/link";

type ExerciseData = {
  exercise: RouterOutputs["exercises"]["getAll"]["items"][number];
};

const Exercise = ({ exercise }: ExerciseData) => {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        <Link href={`/exercises/${exercise.id}`}>{exercise.name}</Link>
      </h2>
      <Markdown>{exercise.how_to_perform}</Markdown>
      <div className="grid grid-cols-3 gap-2">
        <p>
          <span className="font-bold">Category:</span> {exercise.category}
        </p>
        <div>
          {exercise.equipment.length > 0 ? (
            <>
              <p className="font-bold">Equipment</p>
              {exercise.equipment.map((equipment) => (
                <ul
                  key={equipment.id}
                  className="ml-4 flex list-disc flex-col gap-2"
                >
                  <li>{equipment.name}</li>
                </ul>
              ))}
            </>
          ) : null}
        </div>
        <div>
          {exercise.muscles.length > 0 ? (
            <>
              <p className="font-bold">Muscles</p>
              {exercise.muscles.map((muscle) => (
                <ul
                  key={muscle.id}
                  className="ml-4 flex list-disc flex-col gap-2"
                >
                  <li>{muscle.name}</li>
                </ul>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

type ExerciseListProps = {
  selectedCategory: number;
};

const ExerciseList: React.FC<ExerciseListProps> = ({ selectedCategory }) => {
  const { page, setPage, maxPage, setMaxPage } = useContext(BaselineContext);
  const { data, error, status, isFetching } = api.exercises.getAll.useQuery(
    {
      page: page,
      categoryId: selectedCategory,
    },
    {
      placeholderData: (p) => p,
    },
  );

  useEffect(() => {
    if (data?.totalItems) {
      setMaxPage((prevMaxPage) =>
        prevMaxPage === 0
          ? Math.ceil(data.totalItems / DEFAULT_PAGE_SIZE) - 1
          : prevMaxPage,
      );
    }
  }, [data, setMaxPage]);

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

type CategorySelectorProps = object;

const CategorySelector: React.FC<CategorySelectorProps> = ({}) => {
  const { categories, setSelectedCategory } = useContext(BaselineContext);
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
  const { selectedCategory, muscleFilter, setMuscleFilter } =
    useContext(BaselineContext);
  return (
    <div className="mx-auto max-w-screen-md p-4">
      <div className="my-2 grid grid-cols-3 gap-4">
        <CategorySelector />
        <DropdownMenuCheckboxes
          muscleFilter={muscleFilter}
          setMuscleFilter={setMuscleFilter}
        />
        <p>Testing</p>
      </div>
      <ExerciseList selectedCategory={selectedCategory} />
    </div>
  );
};

export default ExercisePage;
