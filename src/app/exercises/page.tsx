"use client";
import React, { Dispatch, SetStateAction, useContext, useState } from "react";

import Markdown from "react-markdown";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { BaselineContext } from "~/state/BaselineContextProvider";
import { api, type RouterOutputs } from "~/trpc/react";

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

const ExerciseList = ({
  selectedCategory,
  page,
  setPage,
}: {
  selectedCategory: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}) => {
  const { data, isLoading, error } = api.exercises.getAll.useQuery({
    page: page,
    categoryId: selectedCategory,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || data.items.length === 0) return <p>No data</p>;
  return (
    <>
      {data.totalItems} items
      {data.items.map((exercise) => (
        <Exercise key={exercise.id} exercise={exercise} />
      ))}
      <div className="flex flex-row gap-2">
        <Button
          onClick={() => setPage((page) => (page === 0 ? page : page - 1))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() =>
            setPage((page) => (data.hasNextPage ? page + 1 : page))
          }
          disabled={!data.hasNextPage}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export const ExercisePage = () => {
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const { categories } = useContext(BaselineContext);

  console.log(categories);

  return (
    <div>
      <Select
        onValueChange={(value) => setSelectedCategory(Number.parseInt(value))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ExerciseList
        selectedCategory={selectedCategory}
        page={page}
        setPage={setPage}
      />
    </div>
  );
};

export default ExercisePage;
