import { Data } from "effect";

export type BoundaryResult<E, A> = Data.TaggedEnum<{
  Failure: { readonly error: E };
  Success: { readonly value: A };
}>;

interface BoundaryResultDefinition extends Data.TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: BoundaryResult<this["A"], this["B"]>;
}

export const BoundaryResult = Data.taggedEnum<BoundaryResultDefinition>();
