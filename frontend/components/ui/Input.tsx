import { forwardRef, InputHTMLAttributes } from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  helperText?: string
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  helperText,
  fullWidth = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const hasError = !!error
  
  const baseInputClasses = 'w-full py-4 glass rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all'
  const errorClasses = hasError ? 'border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50' : ''
  const paddingClasses = Icon ? 
    (iconPosition === 'left' ? 'pl-12 pr-4' : 'pl-4 pr-12') : 
    'px-4'
  
  const inputClasses = `${baseInputClasses} ${errorClasses} ${paddingClasses} ${className}`
  
  return (
    <div className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-white">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm font-medium"
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-400 text-sm">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }