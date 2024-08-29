/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoadingSpinner } from "../LoadingSpinner";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";

type Exercise = NonNullable<Partial<RouterOutputs["exercises"]["getById"]>>;

const exerciseSchema = z.object({
  name: z.string(),
  category: z.number(),
  how_to_perform: z.string(),
  equipment: z.array(z.number()),
  muscles: z.array(z.number()),
});

type ExerciseDetailProps = {
  exercise: Exercise;
};

export const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exercise }) => {
  const form = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: exercise.name ?? "",
      category: exercise.category?.id ?? 0,
      how_to_perform: exercise.how_to_perform ?? "",
      equipment: exercise.equipment?.map((e) => e.equipment.id) ?? [],
      muscles: exercise.muscles?.map((e) => e.muscles.id) ?? [],
    },
  });
  const router = useRouter();
  const { mutate, isPending: isPendingDescriptionUpdate } =
    api.exercises.UpdateExerciseDescriptionWithAI.useMutation({});

  // 2. Define a submit handler.
  const onSubmit = (values: z.infer<typeof exerciseSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    console.log(exercise.id);

    if (!exercise.id) return;
    mutate({ id: exercise.id }, { onSuccess: () => router.refresh() });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            disabled={isPendingDescriptionUpdate}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="how_to_perform"
            disabled={isPendingDescriptionUpdate}
            render={({ field }) => (
              <FormItem>
                <FormLabel>How to perform</FormLabel>
                <FormControl>
                  <Textarea placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>This describes the exercise.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={isPendingDescriptionUpdate}
            onClick={() => {
              onSubmit(form.getValues());
            }}
          >
            {isPendingDescriptionUpdate ? (
              <LoadingSpinner />
            ) : (
              "Generate Description"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};
