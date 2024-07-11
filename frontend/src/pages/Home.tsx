import React, { useEffect, useRef } from 'react';
import { Box, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Logo from '../../src/assets/490x490.svg?react';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const textToDisplay = 'SAMPLE TEXT';
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = 'https://placehold.co/1500x673/DDDDDD/1045CC/webp?text=Image+With+Text';
      img.onload = () => {
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          // Calculate red part boundaries
          const redXStart = Math.floor(canvas.width * 0.163);
          const redWidth = Math.floor(canvas.width * 0.68);
          const redYStart = Math.floor(canvas.height * 0.87);
          const redHeight = Math.floor(canvas.height * 0.18);

          // Set initial font properties
          let fontSize = Math.floor(redHeight / 2.5);
          ctx.font = `${fontSize}px 'Noto Serif'`;
          let textWidth = ctx.measureText(textToDisplay).width;

          // Adjust font size to fit text within red part width
          while (textWidth > redWidth && fontSize > 0) {
            fontSize--;
            ctx.font = `${fontSize}px 'Noto Serif'`;
            textWidth = ctx.measureText(textToDisplay).width;
          }

          // Ensure text also fits within the red height area
          while (fontSize * 2.6 > redHeight && fontSize > 0) {
            fontSize--;
            ctx.font = `${fontSize}px 'Noto Serif'`;
            textWidth = ctx.measureText(textToDisplay).width;
          }

          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;

          ctx.save();
          const scaleFactor = 2.6;
          ctx.scale(1, scaleFactor);

          let textYPosition = (redYStart + (redHeight / 2)) / scaleFactor;
          if (textWidth > redWidth) {
            textYPosition -= 10;
          }

          // Draw the text
          ctx.strokeText(textToDisplay, redXStart + (redWidth / 2), textYPosition);
          ctx.fillText(textToDisplay, redXStart + (redWidth / 2), textYPosition);

          // Restore the context to its original state
          ctx.restore();
        } else {
          console.error('Context is null');
        }
      };
      img.onerror = (error) => {
        console.error('Failed to load image', error);
      };
    } else {
      console.error('Canvas is null');
    }
  }, []);

  return (
    <Container 
      className="homePageContainer"
      sx={{ 
        pt: 2,
        backgroundImage: 'https://placehold.co/1600x896/DDDDDD/1045CC?text=Background+Image',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'center',
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Logo 
          style={{ 
            width: '150px', 
            height: 'auto', 
            marginBottom: '10px', 
            borderRadius: '50%',
            border: `2px ${theme.palette.primary.main} solid` 
          }} 
          viewBox="0 0 500 500" 
        />
      </Box>

      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 4
        }}
      >
        <canvas ref={canvasRef} style={{ width: '65%', height: 'auto', maxWidth: '390px', margin: '0 auto', opacity: 0.95, border: `2px ${theme.palette.primary.main} solid` }} />
      </Box>

      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          mb: 2
        }}
      >
        <Button 
          variant="contained" 
          component={Link} 
          to="/reserve" 
          style={{ 
            textTransform: 'none', 
            backgroundColor: 'white', 
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            opacity: 0.95,
            border: `4px solid ${theme.palette.primary.main}`
          }}
          sx={{ 
            width: { 
              xs: '80%',
              sm: '60%',
              md: '30%'
            },
            fontSize: { 
              xs: '1.2em !important',
              sm: '1.4em !important',
              md: '1.7em !important'
            }, 
            padding: { 
              xs: '0.6em 1.2em !important',
              sm: '0.7em 1.4em !important',
              md: '0.8em 1.6em !important'
            },
            mb: 2
          }}
        >
          Click here to reserve
        </Button>
      </Box>

      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img 
          src="https://placehold.co/1920x2635/DDDDDD/1045CC/webp?text=Image"
          alt="City Representatives"
          width="250"
          height="250"
          style={{ 
            width: '58%',
            height: 'auto', 
            maxWidth: '290px',
            margin: '0 auto',
            opacity: 0.95,
            border: `2px ${theme.palette.primary.main} solid`,
          }} 
        />
      </Box>
      
    </Container>
  );
};

export default HomePage;
