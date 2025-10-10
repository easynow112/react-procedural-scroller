import { RefObject, useCallback, useRef } from "react";
import {
  UseElementRefMapProps,
  UseElementRefMapResult,
} from "../types/hooks/use-element-ref-map";
import { asElementRefMapKey } from "../validation/hooks/use-element-ref-map";
import { asPositiveInteger } from "../validation/number/positive-integer";
import { ProceduralScrollerError } from "../lib/error";
import { mapToObject } from "../lib/map";

export const useElementRefMap = <
  ElementType extends HTMLElement = HTMLElement,
>({
  cacheLimit = asPositiveInteger(1),
}: UseElementRefMapProps): UseElementRefMapResult<ElementType> => {
  const elementRefMap = useRef<Map<string, RefObject<ElementType | null>>>(
    new Map(),
  );

  const getRef: UseElementRefMapResult<ElementType>["getRef"] = useCallback(
    (key) => {
      return elementRefMap.current.get(asElementRefMapKey(key));
    },
    [elementRefMap],
  );

  const getRefOrError: UseElementRefMapResult<ElementType>["getRefOrError"] =
    useCallback(
      <RequireNonNull extends boolean>(
        key: string | number,
        requireNonNull: RequireNonNull,
      ) => {
        const ref = elementRefMap.current.get(asElementRefMapKey(key));
        if (ref && !requireNonNull) {
          return ref as RequireNonNull extends true
            ? RefObject<ElementType>
            : RefObject<ElementType | null>;
        }
        if (ref?.current !== null && requireNonNull) {
          return ref as RequireNonNull extends true
            ? RefObject<ElementType>
            : RefObject<ElementType | null>;
        }
        throw new ProceduralScrollerError(
          `A ref with key=${key} does not exist in elementRefMap`,
          mapToObject(elementRefMap.current),
        );
      },
      [elementRefMap],
    );

  const setRef: UseElementRefMapResult<ElementType>["setRef"] = useCallback(
    (key, ref) => {
      asPositiveInteger(cacheLimit);
      const stringKey = asElementRefMapKey(key);
      const map = elementRefMap.current;
      map.delete(stringKey); // Delete first to update insertion order when re-setting the ref
      map.set(stringKey, ref);
      while (map.size > cacheLimit) {
        map.delete(map.keys().next().value as string);
      }
      return getRefOrError(key, false);
    },
    [cacheLimit, getRefOrError, elementRefMap],
  );

  const getAllRefs: UseElementRefMapResult<ElementType>["getAllRefs"] =
    useCallback(() => {
      return mapToObject(elementRefMap.current);
    }, [elementRefMap]);

  const clearRefs: UseElementRefMapResult<ElementType>["clearRefs"] =
    useCallback(() => {
      elementRefMap.current.clear();
    }, [elementRefMap]);

  return {
    setRef,
    getRef,
    getRefOrError,
    getAllRefs,
    clearRefs,
  };
};
