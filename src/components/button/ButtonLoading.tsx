import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export function ButtonLoading() {
  return (
    <Button variant="outline" disabled>
      <Spinner />
      Loading
    </Button>
  );
}
