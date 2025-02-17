import { Account } from '@app/shared/shared-main/account/account.model'
import { objectKeysTyped } from '@shared/core-utils'
import { hasUserRight } from '@shared/core-utils/users'
import {
  ActorImage,
  HTMLServerConfig,
  NSFWPolicyType,
  User as UserServerModel,
  UserAdminFlag,
  UserNotificationSetting,
  UserRight,
  UserRole,
  VideoChannel
} from '@shared/models'

export class User implements UserServerModel {
  id: number
  username: string
  email: string
  pendingEmail: string | null

  emailVerified: boolean
  emailPublic: boolean
  nsfwPolicy: NSFWPolicyType

  adminFlags?: UserAdminFlag

  autoPlayVideo: boolean
  autoPlayNextVideo: boolean
  autoPlayNextVideoPlaylist: boolean

  p2pEnabled: boolean
  // FIXME: deprecated in 4.1
  webTorrentEnabled: never

  videosHistoryEnabled: boolean
  videoLanguages: string[]

  role: {
    id: UserRole
    label: string
  }

  videoQuota: number
  videoQuotaDaily: number
  videoQuotaUsed?: number
  videoQuotaUsedDaily?: number

  videosCount?: number
  videoCommentsCount?: number

  abusesCount?: number
  abusesAcceptedCount?: number
  abusesCreatedCount?: number

  theme: string

  account: Account
  notificationSettings?: UserNotificationSetting
  videoChannels?: VideoChannel[]

  blocked: boolean
  blockedReason?: string

  noInstanceConfigWarningModal: boolean
  noWelcomeModal: boolean
  noAccountSetupWarningModal: boolean

  pluginAuth: string | null

  lastLoginDate: Date | null

  twoFactorEnabled: boolean

  createdAt: Date

  constructor (hash: Partial<UserServerModel>) {
    this.id = hash.id
    this.username = hash.username
    this.email = hash.email

    this.role = hash.role

    this.videoChannels = hash.videoChannels

    this.videoQuota = hash.videoQuota
    this.videoQuotaDaily = hash.videoQuotaDaily
    this.videoQuotaUsed = hash.videoQuotaUsed
    this.videoQuotaUsedDaily = hash.videoQuotaUsedDaily
    this.videosCount = hash.videosCount
    this.abusesCount = hash.abusesCount
    this.abusesAcceptedCount = hash.abusesAcceptedCount
    this.abusesCreatedCount = hash.abusesCreatedCount
    this.videoCommentsCount = hash.videoCommentsCount

    this.nsfwPolicy = hash.nsfwPolicy
    this.p2pEnabled = hash.p2pEnabled
    this.autoPlayVideo = hash.autoPlayVideo
    this.autoPlayNextVideo = hash.autoPlayNextVideo
    this.autoPlayNextVideoPlaylist = hash.autoPlayNextVideoPlaylist
    this.videosHistoryEnabled = hash.videosHistoryEnabled
    this.videoLanguages = hash.videoLanguages

    this.theme = hash.theme

    this.adminFlags = hash.adminFlags

    this.blocked = hash.blocked
    this.blockedReason = hash.blockedReason

    this.noInstanceConfigWarningModal = hash.noInstanceConfigWarningModal
    this.noWelcomeModal = hash.noWelcomeModal
    this.noAccountSetupWarningModal = hash.noAccountSetupWarningModal

    this.notificationSettings = hash.notificationSettings

    this.twoFactorEnabled = hash.twoFactorEnabled

    this.createdAt = hash.createdAt

    this.pluginAuth = hash.pluginAuth
    this.lastLoginDate = hash.lastLoginDate

    if (hash.account !== undefined) {
      this.account = new Account(hash.account)
    }
  }

  hasRight (right: UserRight) {
    return hasUserRight(this.role.id, right)
  }

  patch (obj: UserServerModel) {
    for (const key of objectKeysTyped(obj)) {
      // FIXME: typings
      (this as any)[key] = obj[key]
    }

    if (obj.account !== undefined) {
      this.account = new Account(obj.account)
    }
  }

  updateAccountAvatar (newAccountAvatars?: ActorImage[]) {
    if (newAccountAvatars) this.account.updateAvatar(newAccountAvatars)
    else this.account.resetAvatar()
  }

  isUploadDisabled () {
    return this.videoQuota === 0 || this.videoQuotaDaily === 0
  }

  isAutoBlocked (serverConfig: HTMLServerConfig) {
    if (serverConfig.autoBlacklist.videos.ofUsers.enabled !== true) return false

    return this.role.id === UserRole.USER && this.adminFlags !== UserAdminFlag.BYPASS_VIDEO_AUTO_BLACKLIST
  }
}
