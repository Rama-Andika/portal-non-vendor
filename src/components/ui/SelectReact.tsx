import { forwardRef } from "react";
import ReactSelect, {
  type GroupBase,
  type Props as ReactSelectProps,
  type SelectInstance,
} from "react-select";
import classNames from "classnames";
import type { TBorderWidth } from "@/types/borderWidth.type";
import type { TColors } from "@/types/colors.type";
import type { TColorIntensity } from "@/types/colorIntensities.type";
import type { TRounded } from "@/types/rounded.type";

export type TSelectVariant = "solid" | "bottomLine";
export type TSelectDimension = "sm" | "default" | "lg" | "xl";

export type TSelectOption = {
  value: unknown;
  label: string;
  isFixed?: boolean;
  isDisabled?: boolean;
  [key: string]: unknown;
};

export type TSelectInstance = SelectInstance<
  TSelectOption,
  boolean,
  GroupBase<TSelectOption>
> | null;

export interface ISelectReactProps extends Partial<
  ReactSelectProps<TSelectOption, boolean, GroupBase<TSelectOption>>
> {
  id?: string;
  name?: string;
  className?: string;
  borderWidth?: TBorderWidth;
  color?: TColors;
  colorIntensity?: TColorIntensity;
  rounded?: TRounded;
  dimension?: TSelectDimension;
  variant?: TSelectVariant;
  disabled?: boolean;
}

const SelectReact = forwardRef<TSelectInstance, ISelectReactProps>(
  (props, ref) => {
    const {
      id,
      name,
      className,
      borderWidth = "border",
      color = "blue",
      colorIntensity = "500",
      rounded = "rounded-md",
      dimension = "default",
      variant = "solid",
      disabled = false,
      options = [],
      value,
      onChange,
      ...rest
    } = props;

    const selectVariantClasses = {
      solid: classNames("border w-full text-sm transition-all", rounded, {
        "border": !disabled,
        "border-zinc-500 bg-gray-200": disabled,
      }),
      bottomLine: classNames(
        "border-b-2 w-full text-sm transition-all",
        rounded,
        {
          "border-zinc-1000": !disabled,
          "border-zinc-500 opacity-25": disabled,
        }
      ),
    };

    const selectDimensionClasses = {
      sm: "!min-h-[2rem] text-sm",
      default: "!min-h-9",
      lg: "!min-h-[3rem] text-lg",
      xl: "!min-h-[3.25rem] text-xl",
    };

    return (
      <ReactSelect
        ref={ref}
        inputId={id || name}
        id={id}
        name={name}
        options={options}
        value={value}
        unstyled
        isDisabled={disabled}
        onChange={onChange}
        classNames={{
          control: ({ isFocused }) =>
            classNames(
              "px-3 py-0.5",
              "w-full",
              selectVariantClasses[variant],
              selectDimensionClasses[dimension],
              {
                "!bg-transparent": isFocused,
              },
              className
            ),
          option: ({ isFocused, isSelected, data }) =>
            classNames("px-1.5 py-1 transition-all", {
              "bg-blue-500 text-white": isSelected,
              "bg-blue-500/50 text-white": !isSelected && isFocused,
              "opacity-50": data.isDisabled,
            }),
          menu: () =>
            classNames(
              "bg-white dark:bg-black shadow-lg text-sm z-[9999]",
              rounded
            ),
          placeholder: () => classNames("text-black/50 dark:text-white/50"),
          multiValue: ({ data }) =>
            classNames("m-0.5 bg-main rounded-md px-1", "text-white", {
              "opacity-50": data.isDisabled,
            }),
          multiValueRemove: ({ data }) =>
            classNames("rounded-md transition-all", {
              hidden: data.isFixed,
              "hover:bg-red-500": !data.isDisabled,
            }),
        }}
        {...rest}
      />
    );
  }
);

SelectReact.displayName = "SelectReact";

export default SelectReact;
