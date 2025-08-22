import {
    ShieldExclamationIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    
} from '@heroicons/react/24/outline';

type StatusType = 'success' | 'fail' | 'pass' | 'warning' | 'error';

interface StatusIconProps {
    type: StatusType;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const StatusIcon: React.FC<StatusIconProps> = ({
    type,
    className = '',
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    const iconConfig = {
        success: {
            icon: CheckCircleIcon,
            color: 'text-green-500'
        },
        fail: {
            icon: XCircleIcon,
            color: 'text-red-500'
        },
        pass: {
            icon: ShieldCheckIcon,
            color: 'text-blue-500'
        },
        warning: {
            icon: ExclamationTriangleIcon,
            color: 'text-yellow-500'
        },
        error: {
            icon: ShieldExclamationIcon,
            color: 'text-red-600'
        }
    };

    const { icon: Icon, color } = iconConfig[type];
    const sizeClass = sizeClasses[size];

    return <Icon className={`${sizeClass} ${color} ${className}`} />;
};

export default StatusIcon;