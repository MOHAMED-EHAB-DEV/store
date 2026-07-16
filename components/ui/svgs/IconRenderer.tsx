import dynamic from "next/dynamic";
import { ComponentProps } from "react";

interface IconRendererProps extends ComponentProps<"svg"> {
  name: string;
}

export const IconRenderer = ({ name, ...rest }: IconRendererProps) => {
  // Webpack will code-split this directory and only download the SVG chunk that is actually rendered.
  const DynamicIcon = dynamic(() =>
    import(`@/components/ui/svgs/icons/${name}`).then((mod) => mod[name])
  );

  return <DynamicIcon {...rest} />;
};
