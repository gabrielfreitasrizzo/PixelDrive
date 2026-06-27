import logoPixelDrive from '../assets/logo-pixel-drive.png';

export function Header() {
    return (
        <header style={{
            position: 'absolute',
            top: '0px',
            left: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
        }}>
            <img 
                src={logoPixelDrive} 
                alt="Logo Pixel Drive" 
                style={{ 
                    height: '150px',
                    width: 'auto',
                    pointerEvents: 'auto' 
                }} 
            />
        </header>
    );
}