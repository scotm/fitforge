// https://devtails.xyz/@adam/building-a-promise-pool-in-typescript
export class PromisePool {
  private concurrency: number;
  private items: Promise<void>[] = [];

  constructor({ concurrency }: { concurrency: number }) {
    this.concurrency = concurrency;
  }

  async add(asyncTaskFn: () => Promise<void>) {
    if (this.items.length >= this.concurrency) {
      // halt execution until fastest promise fulfills
      await Promise.race(this.items);
    }

    const newlyAddedPromise = asyncTaskFn();

    void newlyAddedPromise.then(() => {
      // When promise resolves remove it from stored array of promises
      this.items = this.items.filter((filterItem) => {
        return filterItem !== newlyAddedPromise;
      });
    });

    this.items.push(newlyAddedPromise);
  }
}
