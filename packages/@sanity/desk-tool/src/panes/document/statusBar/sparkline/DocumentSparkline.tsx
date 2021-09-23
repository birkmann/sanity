import {DocumentBadgeDescription} from '@sanity/base'
import {EditStateFor} from '@sanity/base/_internal'
import {useTimeAgo} from '@sanity/base/hooks'
import {EditIcon} from '@sanity/icons'
import {Box, Flex, useElementRect} from '@sanity/ui'
import React, {useEffect, useMemo, useState, useRef} from 'react'
import {raf2} from '../../../../lib/raf'
import {useDocumentHistory} from '../../documentHistory'
import {DocumentBadges} from './DocumentBadges'
import {ReviewChangesButton} from './ReviewChangesButton'
import {IconBadge} from './IconBadge'
import {
  BadgesBox,
  MetadataBox,
  ReviewChangesBadgeBox,
  ReviewChangesButtonBox,
} from './DocumentSparkline.styled'
import {PublishStatus} from './PublishStatus'

interface DocumentSparklineProps {
  badges: DocumentBadgeDescription[]
  editState: EditStateFor | null
  lastUpdated: string | undefined | null
}

export function DocumentSparkline(props: DocumentSparklineProps) {
  const {badges, lastUpdated, editState} = props
  const lastPublished = editState?.published?._updatedAt
  const {historyController} = useDocumentHistory()
  const showingRevision = historyController.onOlderRevision()
  const liveEdit = Boolean(editState?.liveEdit)
  const published = Boolean(editState?.published)
  const changed = Boolean(editState?.draft)
  const loaded = published || changed

  const lastPublishedTimeAgo = useTimeAgo(lastPublished || '', {
    minimal: true,
    agoSuffix: true,
  })

  const lastUpdatedTimeAgo = useTimeAgo(lastUpdated || '', {minimal: true, agoSuffix: true})

  // Keep track of the size of the review changes button
  const [
    reviewChangesButtonElement,
    setReviewChangesButtonElement,
  ] = useState<HTMLButtonElement | null>(null)
  const reviewChangesButtonElementRect = useElementRect(reviewChangesButtonElement)
  const reviewChangesButtonWidth = reviewChangesButtonElementRect?.width
  const reviewChangesButtonWidthRef = useRef(reviewChangesButtonWidth || 0)

  // Use the size of the review changes button as a element query breakpoint
  const metadataBoxBreakpoints = useMemo(
    () => [reviewChangesButtonWidth || reviewChangesButtonWidthRef.current, 225],
    [reviewChangesButtonWidth]
  )

  // Only transition between subsequent state, not the initial
  const [transition, setTransition] = useState(false)
  useEffect(() => {
    if (!transition && loaded) {
      // NOTE: the reason for double RAF here is a common "bug" in browsers.
      // See: https://stackoverflow.com/questions/44145740/how-does-double-requestanimationframe-work
      // There is no need to cancel this animation,
      // since calling it again will cause the same result (transition=true).
      return raf2(() => setTransition(true))
    }

    return undefined
  }, [loaded, transition])

  const metadataBoxStyle = useMemo(
    () =>
      ({
        '--session-layout-width': reviewChangesButtonWidth
          ? `${reviewChangesButtonWidth}px`
          : undefined,
      } as React.CSSProperties),
    [reviewChangesButtonWidth]
  )

  // Maintain the last known width of the review changes button
  useEffect(() => {
    if (reviewChangesButtonWidth) {
      reviewChangesButtonWidthRef.current = reviewChangesButtonWidth
    }
  }, [reviewChangesButtonWidth])

  return (
    <Flex align="center" data-ui="DocumentSparkline">
      {/* Publish status */}
      {(liveEdit || published) && (
        <Box marginRight={1}>
          <PublishStatus
            disabled={showingRevision}
            lastPublishedTimeAgo={lastPublishedTimeAgo}
            lastUpdated={lastUpdated}
            lastUpdatedTimeAgo={lastUpdatedTimeAgo}
            liveEdit={liveEdit}
          />
        </Box>
      )}

      {/* Changes and badges */}
      <MetadataBox
        data-changed={changed || liveEdit ? '' : undefined}
        data-transition={transition ? '' : undefined}
        media={metadataBoxBreakpoints}
        style={metadataBoxStyle}
      >
        {!liveEdit && (
          <>
            <ReviewChangesBadgeBox>
              <IconBadge icon={EditIcon} muted tone="caution" />
            </ReviewChangesBadgeBox>

            <ReviewChangesButtonBox>
              <ReviewChangesButton
                disabled={showingRevision}
                lastUpdatedTimeAgo={lastUpdatedTimeAgo}
                ref={setReviewChangesButtonElement}
              />
            </ReviewChangesButtonBox>
          </>
        )}

        <BadgesBox flex={1} marginLeft={3}>
          <DocumentBadges editState={editState} badges={badges} />
        </BadgesBox>
      </MetadataBox>
    </Flex>
  )
}