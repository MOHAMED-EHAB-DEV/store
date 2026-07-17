const SplitText = (text: string, className: string = "") => {
  const words = text.split(" ");
  return words.map((word, wordIndex) => (
    <span key={wordIndex} className="inline-block whitespace-nowrap">
      {word.split("").map((char, charIndex) => (
        <span
          key={charIndex}
          className={`char inline-block! transition-transform duration-200 hover:scale-110 ${className}`}
        >
          {char}
        </span>
      ))}
      {wordIndex < words.length - 1 && (
        <span className="inline-block" style={{ width: "0.3em" }}>
          &nbsp;
        </span>
      )}
    </span>
  ));
};

export default SplitText;