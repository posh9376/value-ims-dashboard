interface ButtonProps {
  text: string
}

function Button({ text }: ButtonProps) {
  return (
    <button className='btn bg-[#3DAEE9] border-0'>{text}</button>
  )
}

export default Button