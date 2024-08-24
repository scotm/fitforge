"use client";
import React, { useState } from "react";

import Markdown from "react-markdown";
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

export const ExercisePage = () => {
  const [page, setPage] = useState(0);
  // const { categories, muscles } = useContext(BaselineContext);
  const { data, isLoading, error } = api.exercises.getAll.useQuery({
    page: page,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || data.items.length === 0) return <p>No data</p>;

  return (
    <div>
      {data.totalItems} items
      {data.items.map((exercise) => (
        <Exercise key={exercise.id} exercise={exercise} />
      ))}
      <div className="flex flex-row gap-2">
        <button
          onClick={() => setPage((page) => (page === 0 ? page : page - 1))}
          disabled={page === 0}
        >
          Previous
        </button>
        <button
          onClick={() =>
            setPage((page) => (data.hasNextPage ? page + 1 : page))
          }
          disabled={!data.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExercisePage;
