"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { BaselineContext } from "~/state/BaselineContextProvider";
import { ChevronDownIcon } from "lucide-react";

type DropDownMenuCheckboxesProps = {
  muscleFilter: number[];
  setMuscleFilter: React.Dispatch<React.SetStateAction<number[]>>;
};

export const DropdownMenuCheckboxes: React.FC<DropDownMenuCheckboxesProps> = ({
  muscleFilter,
  setMuscleFilter,
}) => {
  const { muscles } = React.useContext(BaselineContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex">
          <span className="font-normal">Muscles</span>
          <div className="flex-grow" />
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {muscles.map((muscle) => (
          <DropdownMenuCheckboxItem
            key={muscle.id}
            checked={muscleFilter.includes(muscle.id)}
            onCheckedChange={(checked) =>
              setMuscleFilter((prev) =>
                checked
                  ? [...prev, muscle.id]
                  : prev.filter((id) => id !== muscle.id),
              )
            }
          >
            {muscle.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
