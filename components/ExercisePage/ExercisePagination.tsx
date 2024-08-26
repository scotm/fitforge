import { type Dispatch, type SetStateAction } from "react";
import { Button } from "../ui/button";

type ExercisePaginationProps = {
  setPage: Dispatch<SetStateAction<number>>;
  page: number;
  maxPage: number;
  plusOrMinus?: number;
};

const DEFAULT_PLUS_OR_MINUS = 5;

export const ExercisePagination: React.FC<ExercisePaginationProps> = ({
  setPage,
  page,
  maxPage,
  plusOrMinus = DEFAULT_PLUS_OR_MINUS,
}) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      <Button
        onClick={() =>
          setPage((page) =>
            page - plusOrMinus < 0 ? page : page - plusOrMinus,
          )
        }
        disabled={page - plusOrMinus < 0}
      >
        - {plusOrMinus}
      </Button>
      <Button
        onClick={() => setPage((page) => (page === 0 ? page : page - 1))}
        disabled={page === 0}
      >
        - 1
      </Button>
      <div className="flex min-w-[30px] items-center justify-center">
        Page: {page + 1} of {maxPage + 1}
      </div>
      <Button
        onClick={() => setPage((page) => (page === maxPage ? page : page + 1))}
        disabled={page === maxPage}
      >
        + 1
      </Button>
      <Button
        onClick={() =>
          setPage((page) =>
            page + plusOrMinus > maxPage ? page : page + plusOrMinus,
          )
        }
        disabled={page + plusOrMinus > maxPage}
      >
        + {plusOrMinus}
      </Button>
    </div>
  );
};
