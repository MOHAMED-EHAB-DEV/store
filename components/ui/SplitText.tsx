const SplitText = (text: string, className: string = "") => {
    return text.split("").map((char, index) => (
        <span
            key={index}
            className={`char ${className}`}
            style={{
                display: "inline-block",
                minWidth: char === " " ? "0.3em" : "auto",
            }}
        >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
};

export default SplitText;