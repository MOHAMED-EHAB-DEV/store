const SplitText = (text: string, className: string = "") => {
    return text.split("").map((char, index) => (
        <span
            key={index}
            className={`char inline-block! ${char === " " ? "w-[0.3em]" : "w-auto"} transition-transform duration-300 hover:scale-110 ${className}`}
            style={{
                minWidth: char === " " ? "0.3em" : "auto",
            }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
    ));
};

export default SplitText;