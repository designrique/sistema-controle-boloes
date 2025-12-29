const Card = ({
  children,
  className = '',
  hover = false,
  padding = true,
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-md
        ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card
