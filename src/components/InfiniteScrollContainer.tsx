import { ComponentProps, PropsWithChildren } from "react";
import { useInView } from "react-intersection-observer";
type InfiniteScrollContainerProps = PropsWithChildren &
  ComponentProps<"div"> & {
    onBottomReached: () => void;
  };

export default function InfiniteScrollContainer({
  onBottomReached,
  children,
  className,
}: InfiniteScrollContainerProps) {
  const { ref } = useInView({
    rootMargin: "200px", // this is the distance from the bottom of the screen
    onChange(inView) {
      // if the ref is in view we will call the onBottomReached function
      if (inView) {
        onBottomReached();
      }
    },
  });
  return (
    <div className={className} data-testid="InfiniteScrollContainer">
      {/* children will be the posts or some other content */}
      {children}
      {/* this is the div that will be used to detect when the ref is in view, when it is in view it will trigger the onChange function */}
      <div ref={ref}></div>
    </div>
  );
}
