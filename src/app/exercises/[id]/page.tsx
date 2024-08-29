import { ExerciseDetail } from "@/components/ExercisePage/ExerciseDetail";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id);
  if (Number.isNaN(id)) {
    return <div>Invalid ID</div>;
  }
  const exercise = await api.exercises.getById({ id });
  if (!exercise) return <div>Exercise not found</div>;

  return (
    <div className="mx-auto min-w-[540px]">
      <h1 className="mb-4 text-3xl font-bold">User Page</h1>
      <ExerciseDetail exercise={exercise} />
    </div>
  );
}
