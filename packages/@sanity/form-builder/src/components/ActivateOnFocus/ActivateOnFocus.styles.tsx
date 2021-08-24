import styled from 'styled-components'
import {Card, Flex} from '@sanity/ui'

export const OverlayContainer = styled.div`
  position: relative;
`

export const ContentContainer = styled.div`
  z-index: 7;
  opacity: 0;
  transition: opacity 300ms linear;
`

export const CardContainer = styled(Card)`
  border: 1px solid var(--card-code-fg-color);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 6;
  transition: opacity 300ms linear;
  opacity: 0;
`

export const FlexContainer = styled(Flex)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  :hover,
  :focus {
    & ${CardContainer} {
      opacity: 0.9;
    }

    & ${ContentContainer} {
      opacity: 1;
    }
  }
`